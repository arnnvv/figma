"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { PoolClient } from "pg";
import type { ActionResult as OldActionResult } from "./components/FormComponent";
import type {
  User,
  Room,
  EmailVerificationRequest,
  EditAccessStatus,
  NewEditAccess,
} from "./lib/db/types";
import { redirect } from "next/navigation";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  type SessionValidationResult,
  validateSessionToken,
} from "./lib/auth";
import {
  hashPassword,
  verifyPasswordHash,
  verifyPasswordStrength,
} from "./lib/password";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "./lib/session";
import { sendEmail } from "./lib/email-verification";
import { Liveblocks } from "@liveblocks/node";
import { utapi } from "./lib/upload";
import type { UploadFileResult } from "uploadthing/types";
import type { ActionResult } from "./lib/form-control";
import { globalGETRateLimit, globalPOSTRateLimit } from "./lib/request";
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
import { db } from "./lib/db";

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
      return { success: false, message: "User not found" };
    }

    if (!existingUser.password) {
      console.error(`User ${email} found but has no password hash stored.`);
      return { success: false, message: "Login configuration error for user." };
    }

    if (!(await verifyPasswordHash(existingUser.password, password))) {
      return { success: false, message: "Wrong Password" };
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expires_at);

    return { success: true, message: "Login successful" };
  } catch (e: any) {
    console.error("Login action error:", e);
    return {
      success: false,
      message: `Login failed: ${e.message || "Unknown error"}`,
    };
  }
};

export const signUpAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Too many requests" };
  const email = formData.get("email");
  if (typeof email !== "string")
    return { success: false, message: "Email is required" };
  if (!/^.+@.+\..+$/.test(email) || email.length >= 256)
    return { success: false, message: "Invalid email" };
  const password = formData.get("password");
  if (typeof password !== "string")
    return { success: false, message: "Password is required" };
  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) return { success: false, message: "Weak Password" };
  const username = formData.get("username");
  if (typeof username !== "string" || !username)
    return { success: false, message: "Name is required" };
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
      if (existingUser.email === email) {
        return { success: false, message: "Email is already in use" };
      }
      if (existingUser.username === username) {
        return { success: false, message: "Username is already taken" };
      }
      return { success: false, message: "User conflict detected." };
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      username,
      email,
      password: hashedPassword,
    };

    const insertedResult = await insertUser_Raw(newUser);
    const userId = insertedResult?.id;

    if (!userId) {
      throw new Error("Failed to retrieve inserted user ID after sign up.");
    }

    await sendEmail({ userId, email });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    await setSessionTokenCookie(sessionToken, session.expires_at);

    return { success: true, message: "Sign up successful" };
  } catch (e: any) {
    console.error("Signup action error:", e);
    if (e.message?.includes("already exists")) {
      return { success: false, message: e.message };
    }
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
    return {
      success: false,
      message: `Error Logging Out: ${e.message || "Unknown error"}`,
    };
  }
};

export const deleteRoomAction = async (
  roomId: string,
): Promise<OldActionResult> => {
  const { user, session } = await getCurrentSession();
  if (!session || !user) return { error: "Not logged in" };

  const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });

  let room: Room | null;
  try {
    room = await findRoomById_Raw(roomId);
  } catch (fetchError: any) {
    console.error(
      `Error fetching room ${roomId} for deletion check:`,
      fetchError,
    );
    return { error: "Failed to check room details." };
  }

  if (!room) return { error: "Room not found" };
  if (room.owner_id !== user.id)
    return { error: "Only the room owner can delete this room" };

  const client: PoolClient = await db.connect();

  try {
    await client.query("BEGIN");

    const deleteAccessSql =
      "DELETE FROM figma_edit_access WHERE room_id_requested_for = $1";
    await client.query(deleteAccessSql, [roomId]);

    const deleteRoomSql = "DELETE FROM figma_rooms WHERE id = $1";
    const deleteRoomResult = await client.query(deleteRoomSql, [roomId]);

    if (deleteRoomResult.rowCount === 0) {
      console.warn(`Room ${roomId} was not found during transaction delete.`);
    }

    await client.query("COMMIT");

    try {
      await liveblocks.deleteRoom(roomId);
      console.log(`Liveblocks room ${roomId} deleted successfully.`);
    } catch (liveblocksError: any) {
      console.error(
        `DB deletion successful, but failed to delete Liveblocks room ${roomId}:`,
        liveblocksError,
      );
    }

    redirect("/dashboard");
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error(
      `Transaction failed for deleting room ${roomId}, rolled back:`,
      e,
    );
    return {
      error: `Something went wrong during room deletion: ${e.message || "Unknown error"}`,
    };
  } finally {
    client.release();
  }
};

export async function verifyOTPAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { user } = await getCurrentSession();
    if (!user) return { success: false, message: "User session not found." };

    const otpValues = [];
    for (let i = 0; i < 8; i++) {
      otpValues.push((formData.get(`otp[${i}]`) as string) || "");
    }
    const otpValue = otpValues.join("");
    if (otpValue.length !== 8)
      return { success: false, message: "Invalid OTP length." };

    const verificationRequest: EmailVerificationRequest | null =
      await findEmailVerificationByUserIdAndCode_Raw(user.id, otpValue);

    if (!verificationRequest) {
      await deleteEmailVerificationByUserId_Raw(user.id).catch((delErr) =>
        console.error("Cleanup error deleting verification request:", delErr),
      );
      return {
        success: false,
        message: "Invalid or expired verification code",
      };
    }

    if (verificationRequest.expires_at < new Date()) {
      await deleteEmailVerificationByUserId_Raw(user.id).catch((delErr) =>
        console.error(
          "Cleanup error deleting expired verification request:",
          delErr,
        ),
      );
      return { success: false, message: "Verification code has expired" };
    }

    const updateCount = await updateUserVerification_Raw(user.id, true);
    if (updateCount === 0) {
      console.warn(
        `OTP verified for user ${user.id}, but user record not found or already verified during update.`,
      );
    }

    await deleteEmailVerificationByUserId_Raw(user.id);

    return { success: true, message: "Email verified successfully" };
  } catch (error: any) {
    console.error("OTP Verification Action Error:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message || "Unknown error"}`,
    };
  }
}

export async function resendOTPAction(): Promise<ActionResult> {
  if (!(await globalGETRateLimit()))
    return { success: false, message: "Rate Limit" };
  const { user } = await getCurrentSession();
  if (!user) return { success: false, message: "Account does not exist" };
  try {
    await sendEmail({ userId: user.id, email: user.email });
    return { success: true, message: "New OTP has been sent to your email." };
  } catch (error: any) {
    console.error("Resend OTP Action error:", error);
    return {
      success: false,
      message: `Failed to resend OTP: ${error.message || "Please try again."}`,
    };
  }
}

export async function forgotPasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Rate Limit" };
  const email = formData.get("email") as string;
  if (typeof email !== "string")
    return { success: false, message: "Email is required" };
  if (!/^.+@.+\..+$/.test(email) || email.length >= 256)
    return { success: false, message: "Invalid email" };

  try {
    const existingUser: User | null = await findUserByEmail_Raw(email);
    if (!existingUser) return { success: false, message: "User not found" };

    await sendEmail({ userId: existingUser.id, email: existingUser.email });
    return { success: true, message: "OTP Sent" };
  } catch (e: any) {
    console.error("Forgot Password Action error:", e);
    return {
      success: false,
      message: `Error occurred: ${e.message || "Unknown error"}`,
    };
  }
}

export async function verifyOTPForgotPassword(
  formData: FormData,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Rate Limit" };

  try {
    const userEmail = formData.get("userEmail") as string;
    if (!userEmail) return { success: false, message: "User email is missing" };

    const user = await findUserByEmail_Raw(userEmail);
    if (!user) return { success: false, message: "User not found" };

    const userId = user.id;
    const otpValues = [];
    for (let i = 0; i < 8; i++) {
      otpValues.push((formData.get(`otp[${i}]`) as string) || "");
    }
    const otpValue = otpValues.join("");
    if (otpValue.length !== 8)
      return { success: false, message: "Invalid OTP length." };

    const verificationRequest = await findEmailVerificationByUserIdAndCode_Raw(
      userId,
      otpValue,
    );

    if (!verificationRequest) {
      await deleteEmailVerificationByUserId_Raw(userId).catch((delErr) =>
        console.error(
          "Cleanup error deleting verification request (forgot pwd):",
          delErr,
        ),
      );
      return {
        success: false,
        message: "Invalid or expired verification code",
      };
    }

    if (verificationRequest.expires_at < new Date()) {
      await deleteEmailVerificationByUserId_Raw(userId).catch((delErr) =>
        console.error(
          "Cleanup error deleting expired verification request (forgot pwd):",
          delErr,
        ),
      );
      return { success: false, message: "Verification code has expired" };
    }

    await deleteEmailVerificationByUserId_Raw(userId);

    return { success: true, message: "Email verified successfully" };
  } catch (error: any) {
    console.error("Forgot Password OTP Verification Error:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message || "Unknown error"}`,
    };
  }
}

export async function resendOTPForgotPassword(
  email: string,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Rate Limit" };
  try {
    const user = await findUserByEmail_Raw(email);
    if (!user) return { success: false, message: "User not found" };
    await sendEmail({ userId: user.id, email: email });
    return { success: true, message: "New OTP has been sent to your email." };
  } catch (error: any) {
    console.error("Resend Forgot Password OTP error:", error);
    return {
      success: false,
      message: `Failed to resend OTP: ${error.message || "Please try again."}`,
    };
  }
}

export async function resetPasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  if (!email || !password || !confirmPassword)
    return { success: false, message: "Missing required fields" };
  if (password !== confirmPassword)
    return { success: false, message: "Passwords don't match" };

  try {
    const user = await findUserByEmail_Raw(email);
    if (!user) return { success: false, message: "User not found" };

    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) return { success: false, message: "Weak Password" };

    const hashedPassword = await hashPassword(password);

    const updateCount = await updateUserPasswordByEmail_Raw(
      email,
      hashedPassword,
    );
    if (updateCount === 0) {
      console.warn(
        `Attempted password reset for ${email}, but user was not found during update.`,
      );
      return {
        success: false,
        message: "User not found during password update.",
      };
    }

    return { success: true, message: "Password successfully reset" };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: `An error occurred during password reset: ${error.message || "Unknown error"}`,
    };
  }
}

export const changeUsernameAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const username = formData.get("username");
  if (typeof username !== "string")
    return { success: false, message: "username is required" };
  if (username.includes(" "))
    return { success: false, message: "Username should not contain spaces." };
  const disallowedPrefixes = ["google-", "github-"];
  if (disallowedPrefixes.some((prefix) => username.startsWith(prefix)))
    return {
      success: false,
      message: "Username cannot start with 'google-' or 'github-'.",
    };

  try {
    const { user } = await getCurrentSession();
    if (!user) return { success: false, message: "Not Logged in" };

    const updatedUser = await updateUserUsernameByEmail_Raw(
      user.email,
      username,
    );
    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to update username: User not found.",
      };
    }

    return { success: true, message: "Username set" };
  } catch (e: any) {
    console.error("Change Username Action error:", e);
    if (e.message?.includes("already taken")) {
      return { success: false, message: "Username already taken" };
    }
    return {
      success: false,
      message: `Failed to set username: ${e.message || "Unknown error"}`,
    };
  }
};

export async function uploadFile(fd: FormData): Promise<ActionResult> {
  const { session, user } = await getCurrentSession();
  if (session === null || !user)
    return { success: false, message: "Not Logged in" };

  const file = fd.get("file") as File;
  if (!file) return { success: false, message: "No file uploaded." };

  let uploadedFile: UploadFileResult;
  try {
    uploadedFile = await utapi.uploadFiles(file);
    if (uploadedFile.error) {
      console.error("UploadThing error:", uploadedFile.error);
      return {
        success: false,
        message: `Upload failed: ${uploadedFile.error.message}`,
      };
    }
    if (!uploadedFile.data?.url) {
      console.error("UploadThing success but no URL returned.");
      return {
        success: false,
        message: "Upload succeeded but failed to get file URL.",
      };
    }
  } catch (uploadError: any) {
    console.error("Error calling UploadThing:", uploadError);
    return {
      success: false,
      message: `Upload service error: ${uploadError.message || "Unknown issue"}`,
    };
  }

  try {
    const updateCount = await updateUserPictureById_Raw(
      user.id,
      uploadedFile.data.url,
    );
    if (updateCount === 0) {
      console.warn(
        `Attempted to update picture for user ${user.id}, but user was not found during update.`,
      );
      return {
        success: false,
        message: "Failed to update profile picture: User not found.",
      };
    }
  } catch (e: any) {
    console.error(`Error updating user picture in DB for user ${user.id}:`, e);
    return {
      success: false,
      message: `Error updating profile picture: ${e.message || "Database error"}`,
    };
  }

  return { success: true, message: `Profile picture updated successfully.` };
}

export const askEditAccessAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Too many requests" };

  const { user, session } = await getCurrentSession();
  if (!session || !user) return { success: false, message: "Not logged in" };

  const roomId = formData.get("roomId") as string;
  if (!roomId) return { success: false, message: "Room ID is required." };

  try {
    const existingRoom = await findRoomById_Raw(roomId);
    if (!existingRoom) return { success: false, message: "Room doesn't exist" };
    if (existingRoom.owner_id === user.id)
      return { success: false, message: "Cannot send request to yourself" };

    const existingRequest = await findPendingOrAcceptedEditAccess_Raw(
      user.id,
      roomId,
    );
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return { success: false, message: "Request already pending" };
      } else {
        return { success: false, message: "You already have edit access" };
      }
    }

    const newAccess: NewEditAccess = {
      requester_id: user.id,
      room_id_requested_for: roomId,
      status: "pending",
    };
    await insertEditAccess_Raw(newAccess);

    return { success: true, message: "Edit access request sent" };
  } catch (e: any) {
    console.error(
      `Error asking edit access for room ${roomId} by user ${user.id}:`,
      e,
    );
    return {
      success: false,
      message: `Failed to send request: ${e.message || "Unknown error"}`,
    };
  }
};

export const handleEditAccessAction = async (
  accessId: number,
  newStatus: EditAccessStatus,
): Promise<ActionResult> => {
  if (!(await globalPOSTRateLimit()))
    return { success: false, message: "Too many requests" };

  const { user, session } = await getCurrentSession();
  if (!session || !user) return { success: false, message: "Not logged in" };

  try {
    const updateCount = await updateEditAccessStatus_Raw(accessId, newStatus);
    if (updateCount === 0) {
      return {
        success: false,
        message: "Request not found or already handled.",
      };
    }
    return { success: true, message: `Request ${newStatus}` };
  } catch (e: any) {
    console.error(
      `Error handling edit access request ${accessId} to status ${newStatus}:`,
      e,
    );
    return {
      success: false,
      message: `Failed to handle request: ${e.message || "Unknown error"}`,
    };
  }
};
