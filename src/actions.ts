"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { ActionResult } from "./components/FormComponent";
import { editAccess, rooms, type User, users } from "./lib/db/schema";
import { db, pool } from "./lib/db";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
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
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
} from "./lib/email-verification";

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

    const emailVerificationRequest = await createEmailVerificationRequest(
      userId,
      email,
    );

    sendVerificationEmail(
      emailVerificationRequest.email,
      emailVerificationRequest.code,
    );

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
  console.log("action started")
  const otpValues = [];
  for (let i = 0; i < 8; i++) {
    otpValues.push(formData.get(`otp[${i}]`) || "");
  }
  const otpValue = otpValues.join("");
  console.log("OTP submitted:", otpValue);

  // Here you would typically send the OTP to your server for verification
  return { message: `OTP submitted: ${otpValue}` };
}
