import { eq } from "drizzle-orm";
import { db } from "./db";
import { User, users } from "./db/schema";
import { generateRandomPassword, hashPassword } from "./password";

export async function createUserGoogle(
  email: string,
  picture: string,
): Promise<User> {
  try {
    const hashedPassword = await hashPassword(generateRandomPassword(10));
    const [newUser] = await db
      .insert(users)
      .values({
        username: `google-${email}`,
        email,
        password: hashedPassword,
        picture: picture,
        verified: true,
      })
      .returning();

    return newUser;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.picture === null) {
        const [newUser] = await db
          .update(users)
          .set({ picture })
          .where(eq(users.email, user.email))
          .returning();
        return newUser;
      }
      return user;
    }
    throw error;
  }
}

export async function getUserFromGmail(email: string): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, `google-${email}`))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Error fetching user by Google ID:", error);
    throw error;
  }
}

export async function createUserGithub(
  githubId: number,
  email: string,
  username: string,
): Promise<User> {
  try {
    const hashedPassword = await hashPassword(generateRandomPassword(10));

    const [newUser] = await db
      .insert(users)
      .values({
        username: `github-${username}`,
        email,
        password: hashedPassword,
        picture: `https://avatars.githubusercontent.com/u/${githubId}`,
        verified: true,
      })
      .returning();
    return newUser;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (user.picture === null) {
        const [newUser] = await db
          .update(users)
          .set({
            picture: `https://avatars.githubusercontent.com/u/${githubId}`,
          })
          .where(eq(users.email, user.email))
          .returning();
        return newUser;
      }
      return user;
    }
    throw error;
  }
}

export async function getUserFromGitHubId(
  githubId: number,
): Promise<User | null> {
  const foundUsers = await db
    .select()
    .from(users)
    .where(
      eq(users.picture, `https://avatars.githubusercontent.com/u/${githubId}`),
    )
    .limit(1);

  return foundUsers.length > 0 ? foundUsers[0] : null;
}
