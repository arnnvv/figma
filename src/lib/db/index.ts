import * as schema from "./schema";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

export const getDB = (): string =>
  process.env.DATABASE_URL ??
  ((): never => {
    throw new Error("Missing DATABASE_URL");
  })();

export const pool = new Pool({
  connectionString: getDB(),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
});
export const db = drizzle(pool, { schema });
