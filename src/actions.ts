"use server";

import { cache } from "react";
import { Session, User as LuciaUser, LegacyScrypt, generateId } from "lucia";
import { cookies } from "next/headers";
import lucia from "./lib/auth";
import { ActionResult } from "./components/FormComponent";
import { rooms, User, users } from "./lib/db/schema";
import { db } from "./lib/db";
import { redirect } from "next/navigation";
import { validateEmail } from "./lib/validate";
import { eq } from "drizzle-orm";

export const validateRequest = cache(
  async (): Promise<
    { user: LuciaUser; session: Session } | { session: null; user: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId)
      return {
        session: null,
        user: null,
      };
    const validSession = await lucia.validateSession(sessionId);
    try {
      if (validSession.session && validSession.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(
          validSession.session.id,
        );
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!validSession.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch (e) {
      console.error(e);
    }
    return validSession;
  },
);

export const logInAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const email = formData.get("email");
  if (typeof email !== "string") return { error: "Email is required" };
  if (!validateEmail({ email })) return { error: "Invalid email" };
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 64
  )
    return { error: "Invalid password" };
  try {
    const existingUser: User | undefined = (await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })) as User | undefined;

    if (!existingUser) return { error: "User not found" };
    const validPassword = await new LegacyScrypt().verify(
      existingUser.password,
      password,
    );
    if (!validPassword) return { error: "Incorrect Password" };
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch {
    return { error: "Something went wrong" };
  }
  return redirect("/dashboard");
};

export const signUpAction = async (
  _: any,
  formData: FormData,
): Promise<ActionResult> => {
  const email = formData.get("email");
  if (typeof email !== "string") return { error: "Email is required" };
  if (!validateEmail({ email })) return { error: "Invalid email" };
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 64
  )
    return { error: "Invalid password" };
  const name = formData.get("name");
  if (typeof name !== "string" || !name) return { error: "Name is required" };
  const id = generateId(10);
  try {
    const hashedPassword = await new LegacyScrypt().hash(password);
    const existingUser = (await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })) as User | undefined;
    if (existingUser) return { error: "User already exists" };

    const newUser = {
      id,
      name,
      email,
      password: hashedPassword,
    };

    await db.insert(users).values(newUser);

    const session = await lucia.createSession(id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch {
    return { error: "Unexpected error" };
  }
  return redirect("/dashboard");
};

export const signOutAction = async (): Promise<ActionResult> => {
  const { session } = await validateRequest();
  if (!session) return { error: "not logged in" };
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
};

export const deleteRoomAction = async (
  roomId: string,
): Promise<ActionResult> => {
  const { session } = await validateRequest();
  if (!session) return { error: "Not logged in" };
  await db.delete(rooms).where(eq(rooms.id, roomId));
  return redirect("/dashboard");
};
