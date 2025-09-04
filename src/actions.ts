"use server";

import { Liveblocks } from "@liveblocks/node";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PoolClient } from "pg";
import { cache } from "react";
import type { UploadFileResult } from "uploadthing/types";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  type SessionValidationResult,
  validateSessionToken,
} from "./lib/auth";
import { db } from "./lib/db";
import {
  deleteEmailVerificationByUserId_Raw,
  findEmailVerificationByUserIdAndCode_Raw,
  findPendingOrAcceptedEditAccess_Raw,
  findRoomById_Raw,
  findUserByEmail_Raw,
  findUserByEmailOrUsername_Raw,
  insertEditAccess_Raw,
  insertUser_Raw,
  updateEditAccessStatus_Raw,
  updateUserPasswordByEmail_Raw,
  updateUserPictureById_Raw,
  updateUserUsernameByEmail_Raw,
  updateUserVerification_Raw,
} from "./lib/db/inlinequeries";
import type { EditAccessStatus, Room, User } from "./lib/db/types";
import { sendEmail } from "./lib/email-verification";
import type { ActionResult } from "./lib/form-control";
import {
  hashPassword,
  verifyPasswordHash,
  verifyPasswordStrength,
} from "./lib/password";
import { globalGETRateLimit, globalPOSTRateLimit } from "./lib/request";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "./lib/session";
import { utapi } from "./lib/upload";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get("session")?.value ?? null;
    if (token === null) {
      return { session: null, user: null };
    }
    const result = await validateSessionToken(token);
    return result;
  },
);

export const logInAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit())) {
    return { success: false, message: "Too many requests" };
  }
  const email = formData.get("email");
  if (typeof email !== "string")
    return { success: false, message: "Email is required" };
  if (!/^.+@.+\..+$/.test(email) || email.length >= 256)
    return { success: false, message: "Invalid email" };
  const password = formData.get("password");
  if (typeof password !== "string")
    return { success: false, message: "Password is required" };

  try {
    const existingUser: User | null = await findUserByEmail_Raw(email);

    if (!existingUser) {
      return { success: false, message: "Invalid email or password" };
    }

    if (!existingUser.password_hash) {
      return {
        success: false,
        message:
          "This account was created using a social login. Please sign in with Google or GitHub.",
      };
    }

    if (!(await verifyPasswordHash(existingUser.password_hash, password))) {
      return { success: false, message: "Invalid email or password" };
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expires_at);

    return { success: true, message: "Login successful" };
  } catch (e: any) {
    console.error("Login action error:", e);
    return {
      success: false,
      message: `An unexpected error occurred during login.`,
    };
  }
};

export const signUpAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Too many requests" };
  const email = formData.get("email") as string;
  if (!email) return { success: false, message: "Email is required" };
  if (!/^.+@.+\..+$/.test(email) || email.length >= 256)
    return { success: false, message: "Invalid email" };
  const password = formData.get("password") as string;
  if (!password) return { success: false, message: "Password is required" };
  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) return { success: false, message: "Weak Password" };
  const username = formData.get("username") as string;
  if (!username) return { success: false, message: "Username is required" };
  if (username.includes(" "))
    return { success: false, message: "Username should not contain spaces." };
  const disallowedPrefixes = ["google-", "github-"];
  if (disallowedPrefixes.some((prefix) => username.startsWith(prefix)))
    return {
      success: false,
      message: "Username cannot start with 'google-' or 'github-'.",
    };

  try {
    const existingUser: User | null = await findUserByEmailOrUsername_Raw(
      email,
      username,
    );

    if (existingUser) {
      return {
        success: false,
        message:
          existingUser.email === email
            ? "Email is already in use"
            : "Username is already taken",
      };
    }

    const hashedPassword = await hashPassword(password);
    const { id: userId } = await insertUser_Raw({
      username,
      email,
      password_hash: hashedPassword,
    });

    await sendEmail({ userId, email });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    await setSessionTokenCookie(sessionToken, session.expires_at);

    return { success: true, message: "Sign up successful" };
  } catch (e: any) {
    console.error("Signup action error:", e);
    return {
      success: false,
      message: `Sign up failed: ${e.message || "Unknown error"}`,
    };
  }
};

export const signOutAction = async (): Promise<ActionResult> => {
  if (!(await globalGETRateLimit())) {
    return { success: false, message: "Too many requests" };
  }
  const { session } = await getCurrentSession();
  if (session === null) return { success: false, message: "Not authenticated" };
  try {
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return { success: true, message: "Logging Out" };
  } catch (e: any) {
    console.error("Signout action error:", e);
    return { success: false, message: "Error Logging Out" };
  }
};

export const deleteRoomAction = async (
  roomId: string,
): Promise<ActionResult> => {
  const { user, session } = await getCurrentSession();
  if (!session || !user) return { success: false, message: "Not logged in" };

  const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });

  const room: Room | null = await findRoomById_Raw(roomId);
  if (!room) return { success: false, message: "Room not found" };
  if (room.owner_id !== user.id)
    return {
      success: false,
      message: "Only the room owner can delete this room",
    };

  const client: PoolClient = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM figma_edit_access WHERE room_id_requested_for = $1",
      [roomId],
    );
    await client.query("DELETE FROM figma_rooms WHERE id = $1", [roomId]);
    await client.query("COMMIT");
    await liveblocks.deleteRoom(roomId);
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error(`Transaction failed for deleting room ${roomId}:`, e);
    return { success: false, message: `Failed to delete room.` };
  } finally {
    client.release();
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
};

export async function verifyOTPAction(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "User session not found." };
  const otpValues = Array.from({ length: 8 }, (_, i) =>
    formData.get(`otp[${i}]`),
  );
  const otpValue = otpValues.join("");

  const req = await findEmailVerificationByUserIdAndCode_Raw(user.id, otpValue);
  if (!req || req.expires_at < new Date()) {
    await deleteEmailVerificationByUserId_Raw(user.id);
    return { success: false, message: "Invalid or expired verification code" };
  }

  await updateUserVerification_Raw(user.id, true);
  await deleteEmailVerificationByUserId_Raw(user.id);
  return { success: true, message: "Email verified successfully" };
}

export async function resendOTPAction(): Promise<ActionResult> {
  if (!(await globalGETRateLimit()))
    return { success: false, message: "Rate Limit" };
  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "Account does not exist" };
  try {
    await sendEmail({ userId: user.id, email: user.email });
    return { success: true, message: "New OTP has been sent." };
  } catch {
    return { success: false, message: "Failed to resend OTP." };
  }
}

export async function forgotPasswordAction(
  _: any,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Rate Limit" };
  const email = formData.get("email") as string;
  if (!email || !/^.+@.+\..+$/.test(email))
    return { success: false, message: "Invalid email" };

  const user = await findUserByEmail_Raw(email);
  if (!user) return { success: false, message: "User not found" };

  await sendEmail({ userId: user.id, email: user.email });
  return { success: true, message: "OTP Sent" };
}

export async function verifyOTPForgotPassword(
  formData: FormData,
): Promise<ActionResult> {
  const userEmail = formData.get("userEmail") as string;
  const user = await findUserByEmail_Raw(userEmail);
  if (!user) return { success: false, message: "User not found" };

  const otpValue = Array.from({ length: 8 }, (_, i) =>
    formData.get(`otp[${i}]`),
  ).join("");
  const req = await findEmailVerificationByUserIdAndCode_Raw(user.id, otpValue);
  if (!req || req.expires_at < new Date()) {
    await deleteEmailVerificationByUserId_Raw(user.id);
    return { success: false, message: "Invalid or expired code" };
  }
  await deleteEmailVerificationByUserId_Raw(user.id);
  return { success: true, message: "Email verified successfully" };
}

export async function resendOTPForgotPassword(
  email: string,
): Promise<ActionResult> {
  if (!(await globalGETRateLimit()))
    return { success: false, message: "Rate Limit" };
  const user = await findUserByEmail_Raw(email);
  if (!user) return { success: false, message: "User not found" };
  await sendEmail({ userId: user.id, email });
  return { success: true, message: "New OTP has been sent." };
}

export async function resetPasswordAction(
  _: any,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (password !== formData.get("confirmPassword"))
    return { success: false, message: "Passwords don't match" };
  if (!(await verifyPasswordStrength(password)))
    return { success: false, message: "Weak Password" };

  const user = await findUserByEmail_Raw(email);
  if (!user) return { success: false, message: "User not found" };

  const hashedPassword = await hashPassword(password);
  await updateUserPasswordByEmail_Raw(email, hashedPassword);
  return { success: true, message: "Password successfully reset" };
}

export const changeUsernameAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const username = formData.get("username") as string;
  if (!username) return { success: false, message: "Username is required" };
  if (username.includes(" "))
    return { success: false, message: "Username should not contain spaces." };
  if (["google-", "github-"].some((p) => username.startsWith(p)))
    return {
      success: false,
      message: "Username cannot start with 'google-' or 'github-'.",
    };

  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "Not Logged in" };

  try {
    await updateUserUsernameByEmail_Raw(user.email, username);

    revalidatePath("/");
    revalidatePath("/get-username");

    return { success: true, message: "Username set" };
  } catch (e: any) {
    return {
      success: false,
      message:
        e.message === "Username already taken."
          ? e.message
          : "Failed to set username.",
    };
  }
};

export async function uploadFile(fd: FormData): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "Not Logged in" };
  const file = fd.get("file") as File;
  const uploadedFile: UploadFileResult = await utapi.uploadFiles(file);
  if (uploadedFile.error)
    return { success: false, message: uploadedFile.error.message };
  await updateUserPictureById_Raw(user.id, uploadedFile.data.ufsUrl);
  return { success: true, message: "Image updated" };
}

export const askEditAccessAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Too many requests" };
  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "Not logged in" };

  const roomId = formData.get("roomId") as string;
  if (!roomId) return { success: false, message: "Room ID is required." };

  const room = await findRoomById_Raw(roomId);
  if (!room) return { success: false, message: "Room doesn't exist" };
  if (room.owner_id === user.id)
    return { success: false, message: "You are the owner of this room" };

  const req = await findPendingOrAcceptedEditAccess_Raw(user.id, roomId);
  if (req)
    return {
      success: false,
      message:
        req.status === "pending"
          ? "Request already pending"
          : "You already have edit access",
    };

  await insertEditAccess_Raw({
    requester_id: user.id,
    room_id_requested_for: roomId,
    status: "pending",
  });
  return { success: true, message: "Edit access request sent" };
};

export const handleEditAccessAction = async (
  accessId: number,
  newStatus: EditAccessStatus,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Too many requests" };
  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "Not logged in" };

  const updated = await updateEditAccessStatus_Raw(accessId, newStatus);
  if (updated === 0) return { success: false, message: "Request not found." };
  revalidatePath("/dashboard");
  return { success: true, message: `Request ${newStatus}` };
};
