"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { ActionResult } from "./components/FormComponent";
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
  SessionValidationResult,
  validateSessionToken,
} from "./lib/auth";
import {
  hashPassword,
  verifyPasswordHash,
  verifyPasswordStrength,
} from "./lib/password";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "./lib/session";
import { sendEmail } from "./lib/email-verification";

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
  const email = formData.get("email");
  if (typeof email !== "string") return { error: "Email is required" };
  if (!/^.+@.+\..+$/.test(email) && email.length < 256)
    return { error: "Invalid email" };
  const password = formData.get("password");
  if (typeof password !== "string") return { error: "Password is required" };
  try {
    const existingUser: User | undefined = (await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })) as User | undefined;

    if (!existingUser) return { error: "User not found" };

    if (!(await verifyPasswordHash(existingUser.password, password)))
      return { error: "Wrong Password" };
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (e) {
    return { error: JSON.stringify(e) };
  }
  return redirect("/dashboard");
};

export const signUpAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const email = formData.get("email");
  if (typeof email !== "string") return { error: "Email is required" };
  if (!/^.+@.+\..+$/.test(email) && email.length < 256)
    return { error: "Invalid email" };
  const password = formData.get("password");
  if (typeof password !== "string") return { error: "Password is required" };
  const strongPassword = await verifyPasswordStrength(password);
  if (!strongPassword) return { error: "Weak Password" };
  const name = formData.get("name");
  if (typeof name !== "string" || !name) return { error: "Name is required" };
  try {
    const existingUser = (await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })) as User | undefined;
    if (existingUser) return { error: "User already exists" };

    const hashedPassword = await hashPassword(password);

    const newUser = {
      name,
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
  } catch (e) {
    return { error: JSON.stringify(e) };
  }
  return redirect("/email-verification");
};

export const signOutAction = async (): Promise<ActionResult> => {
  const { session } = await getCurrentSession();
  if (session === null) return { error: "Not authenticated" };

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
};

export const deleteRoomAction = async (
  roomId: string,
): Promise<ActionResult> => {
  const { session } = await getCurrentSession();
  if (!session) return { error: "Not logged in" };
  let connection;
  try {
    connection = await pool.connect();
    await connection.query("BEGIN;");

    await db
      .delete(editAccess)
      .where(eq(editAccess.roomIdRequestedFor, roomId));

    await db.delete(rooms).where(eq(rooms.id, roomId));

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
  } catch (error) {
    return {
      success: false,
      message: "Failed to resend OTP. Please try again.",
    };
  }
}

export async function forgotPasswordAction(formData: FormData) {
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
  } catch (error) {
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
