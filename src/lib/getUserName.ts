import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

export const getNameFromId = async (userId: number): Promise<string | null> => {
  try {
    const result = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length > 0) {
      return result[0].name;
    } else {
      console.log(`No user found with ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user name for ID ${userId}:`, error);
    return null;
  }
};
