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
