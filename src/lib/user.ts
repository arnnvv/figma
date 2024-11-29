import { eq } from "drizzle-orm";
import { db } from "./db";
import { User, users } from "./db/schema";
import { generateRandomPassword } from "./password";

export async function createUserGoogle(
  googleId: string,
  email: string,
  picture: string,
): Promise<User> {
  try {
    const [newUser] = await db
      .insert(users)
      .values({
        username: `google-${googleId}`,
        email,
        password: generateRandomPassword(10),
        picture: picture,
        verified: true,
      })
      .returning();

    return newUser;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw new Error("A user with this Google ID or email already exists");
    }
    throw error;
  }
}

export async function getUserFromGoogleId(
  googleId: string,
): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, `google-${googleId}`))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("Error fetching user by Google ID:", error);
    throw error;
  }
}

export async function createUserGithub(githubId: number, email: string, username: string): Promise<User> {
try {
    const [newUser] = await db
      .insert(users)
      .values({
        username: `github-${username}`,
        email,
        password: generateRandomPassword(10),
        picture: `https://avatars.githubusercontent.com/u/${githubId}`,
        verified: true,
      })
      .returning();
    return newUser;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw new Error("A user with this GitHub ID or email already exists");
    }
    throw error;
  }
}

export async function getUserFromGitHubId(githubId: number): Promise<User | null> {
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.picture, `https://avatars.githubusercontent.com/u/${githubId}`))
      .limit(1);

    return foundUsers.length > 0 ? foundUsers[0] : null;
}
