import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";
import { db } from "./db";
import { sessions, type User, users } from "./db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(attributes: Omit<User, "id">): {
    name: string;
    email: string;
    number: string | null;
  } {
    return {
      name: attributes.name,
      email: attributes.email,
      number: attributes.number,
    };
  },
  sessionExpiresIn: new TimeSpan(30, "d"),
});
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<User, "id">;
  }
}

export default lucia;
