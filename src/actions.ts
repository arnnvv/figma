"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import type { ActionResult as OldActionResult } from "./components/FormComponent";
import {
  editAccess,
  emailVerificationRequests,
  rooms,
  type User,
  users,
} from "./lib/db/schema";
import { db, pool } from "./lib/db";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
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
  if (!globalPOSTRateLimit()) {
    return {
      success: false,
      message: "Too many requests",
    };
  }

  const email = formData.get("email");
  if (typeof email !== "string")
    return {
      success: false,
      message: "Email is required",
    };

  if (!/^.+@.+\..+$/.test(email) || email.length >= 256)
    return {
      success: false,
      message: "Invalid email",
    };

  const password = formData.get("password");
  if (typeof password !== "string")
    return {
      success: false,
      message: "Password is required",
    };

  try {
    const existingUser: User | undefined = (await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })) as User | undefined;

    if (!existingUser)
      return {
        success: false,
        message: "User not found",
      };

    if (!(await verifyPasswordHash(existingUser.password, password)))
      return {
        success: false,
        message: "Wrong Password",
      };

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    return {
      success: true,
      message: "Login successful",
    };
  } catch (e) {
    return {
      success: false,
      message: `Login failed: ${JSON.stringify(e)}`,
    };
  }
};

export const signUpAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  if (!globalPOSTRateLimit()) {
    return {
      success: false,
      message: "Too many requests",
    };
  }

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

  if (username.includes(" ")) {
    return {
      success: false,
      message: "Username should not contain spaces.",
    };
  }

  const disallowedPrefixes = ["google-", "github-"];
  if (disallowedPrefixes.some((prefix) => username.startsWith(prefix))) {
    return {
      success: false,
      message: "Username cannot start with 'google-' or 'github-'.",
    };
  }
  try {
    const existingUser = (await db.query.users.findFirst({
      where: (users, { or, eq }) =>
        or(eq(users.email, email), eq(users.username, username)),
    })) as User | undefined;

    if (existingUser) {
      if (existingUser.email === email) {
        return { success: false, message: "Email is already in use" };
      }
      if (existingUser.username === username) {
        return { success: false, message: "Username is already taken" };
      }
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      username,
      email,
      password: hashedPassword,
    };

    const insertedUser = await db
      .insert(users)
      .values(newUser)
      .returning({ id: users.id });

    const userId = insertedUser[0]?.id;
    if (!userId) throw new Error("Failed to retrieve inserted user ID");

    await sendEmail({
      userId,
      email,
    });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    return { success: true, message: "Sign up successful" };
  } catch (e) {
    return {
      success: false,
      message: `Sign up failed: ${JSON.stringify(e)}`,
    };
  }
};

export const signOutAction = async (): Promise<ActionResult> => {
  if (!globalGETRateLimit()) {
    return {
      success: false,
      message: "Too many requests",
    };
  }

  const { session } = await getCurrentSession();
  if (session === null)
    return {
      success: false,
      message: "Not authenticated",
    };

  try {
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return {
      success: true,
      message: "LoggingOut",
    };
  } catch (e) {
    return {
      success: false,
      message: `Error LoggingOut ${e}`,
    };
  }
};

export const deleteRoomAction = async (
  roomId: string,
): Promise<OldActionResult> => {
  const { user, session } = await getCurrentSession();
  if (!session) return { error: "Not logged in" };
  const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });
  const room = await db.query.rooms.findFirst({
    where: (rooms, { eq }) => eq(rooms.id, roomId),
  });

  if (!room) return { error: "Room not found" };
  if (room.ownerId !== user.id)
    return { error: "Only the room owner can delete this room" };

  let connection;
  try {
    connection = await pool.connect();
    await connection.query("BEGIN;");

    await db
      .delete(editAccess)
      .where(eq(editAccess.roomIdRequestedFor, roomId));

    await db.delete(rooms).where(eq(rooms.id, roomId));

    await liveblocks.deleteRoom(roomId);

    await connection.query("COMMIT");

    return redirect("/dashboard");
  } catch (e) {
    await connection?.query("ROLLBACK");
    return { error: `Something went wrong: ${e}` };
  } finally {
    connection?.release();
  }
};

export async function verifyOTPAction(formData: FormData) {
  try {
    const { user } = await getCurrentSession();
    if (!user) return;
    const otpValues = [];
    for (let i = 0; i < 8; i++) {
      otpValues.push(formData.get(`otp[${i}]`) || "");
    }
    const otpValue = otpValues.join("");

    // Find the verification request for this user
    const verificationRequest =
      await db.query.emailVerificationRequests.findFirst({
        where: and(
          eq(emailVerificationRequests.userId, user.id),
          eq(emailVerificationRequests.code, otpValue),
        ),
      });

    // Check if OTP is valid
    if (!verificationRequest) {
      // Delete the verification request regardless of success
      await db
        .delete(emailVerificationRequests)
        .where(eq(emailVerificationRequests.userId, user.id));

      return {
        success: false,
        message: "Invalid or expired verification code",
      };
    }

    // Check if OTP has expired
    if (verificationRequest.expiresAt < new Date()) {
      // Delete the verification request
      await db
        .delete(emailVerificationRequests)
        .where(eq(emailVerificationRequests.userId, user.id));

      return {
        success: false,
        message: "Verification code has expired",
      };
    }

    // Update user as verified
    await db.update(users).set({ verified: true }).where(eq(users.id, user.id));

    // Delete the verification request
    await db
      .delete(emailVerificationRequests)
      .where(eq(emailVerificationRequests.userId, user.id));

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function resendOTPAction() {
  if (!globalGETRateLimit()) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  const { user } = await getCurrentSession();
  if (!user)
    return {
      success: false,
      message: "Account Dosen't exist",
    };
  try {
    await sendEmail({
      userId: user.id,
      email: user.email,
    });

    return {
      success: true,
      message: "New OTP has been sent to your email.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to resend OTP. Please try again.",
    };
  }
}

export async function forgotPasswordAction(formData: FormData) {
  if (!globalPOSTRateLimit()) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  const email = formData.get("email") as string;
  if (typeof email !== "string")
    return {
      success: false,
      message: "Email is required",
    };
  if (!/^.+@.+\..+$/.test(email) && email.length < 256)
    return {
      success: false,
      message: "Invalid email",
    };

  const existingUser: User | undefined = (await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  })) as User | undefined;

  if (!existingUser)
    return {
      success: false,
      message: "User not found",
    };

  try {
    await sendEmail({
      userId: existingUser.id,
      email: existingUser.email,
    });

    return {
      success: true,
      message: "OTP Sent",
    };
  } catch (e) {
    return {
      susscess: false,
      message: `Error occured ${e}`,
    };
  }
}
export async function verifyOTPForgotPassword(formData: FormData) {
  if (!globalPOSTRateLimit()) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  try {
    const userEmail = formData.get("userEmail") as string;
    if (!userEmail) {
      return {
        success: false,
        message: "User email is missing",
      };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const userId = user.id;

    const otpValues = [];
    for (let i = 0; i < 8; i++) {
      otpValues.push((formData.get(`otp[${i}]`) as string) || "");
    }
    const otpValue = otpValues.join("");
    const verificationRequest =
      await db.query.emailVerificationRequests.findFirst({
        where: and(
          eq(emailVerificationRequests.userId, userId),
          eq(emailVerificationRequests.code, otpValue),
        ),
      });

    if (!verificationRequest) {
      await db
        .delete(emailVerificationRequests)
        .where(eq(emailVerificationRequests.userId, userId));

      return {
        success: false,
        message: "Invalid or expired verification code",
      };
    }

    if (verificationRequest.expiresAt < new Date()) {
      await db
        .delete(emailVerificationRequests)
        .where(eq(emailVerificationRequests.userId, userId));

      return {
        success: false,
        message: "Verification code has expired",
      };
    }

    await db
      .delete(emailVerificationRequests)
      .where(eq(emailVerificationRequests.userId, userId));

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function resendOTPForgotPassword(email: string) {
  if (!globalPOSTRateLimit()) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await sendEmail({
      userId: user.id,
      email: email,
    });

    return {
      success: true,
      message: "New OTP has been sent to your email.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to resend OTP. Please try again.",
    };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return {
      success: false,
      message: "Missing required fields",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords don't match",
    };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword)
      return {
        success: false,
        message: "Weak Password",
      };

    const hashedPassword = await hashPassword(password);

    await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.email, email));

    return {
      success: true,
      message: "Password successfully reset",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

export const changeUsernameAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const username = formData.get("username");
  if (typeof username !== "string")
    return {
      success: false,
      message: "username is required",
    };

  if (username.includes(" ")) {
    return {
      success: false,
      message: "Username should not contain spaces.",
    };
  }

  const disallowedPrefixes = ["google-", "github-"];
  if (disallowedPrefixes.some((prefix) => username.startsWith(prefix))) {
    return {
      success: false,
      message: "Username cannot start with 'google-' or 'github-'.",
    };
  }

  try {
    const { user } = await getCurrentSession();
    if (!user)
      return {
        success: false,
        message: "Not Logged in",
      };

    await db
      .update(users)
      .set({ username: username })
      .where(eq(users.email, user.email))
      .returning();

    return {
      success: true,
      message: "Username set",
    };
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique constraint")) {
      return {
        success: false,
        message: "Username already taken",
      };
    }
    return {
      success: false,
      message: `${e}`,
    };
  }
};

export async function uploadFile(fd: FormData): Promise<ActionResult> {
  const { session, user } = await getCurrentSession();
  if (session === null)
    return {
      success: false,
      message: "Not Logged in",
    };
  const file = fd.get("file") as File;

  const uploadedFile: UploadFileResult = await utapi.uploadFiles(file);
  if (uploadedFile.error)
    return {
      success: false,
      message: uploadedFile.error.message,
    };
  try {
    await db
      .update(users)
      .set({ picture: uploadedFile.data.url })
      .where(eq(users.id, user.id));
  } catch (e) {
    return {
      success: false,
      message: `Error updating image ${e}`,
    };
  }
  return {
    success: true,
    message: uploadedFile.data.url,
  };
}
