import { Pool } from "pg";

export const getDB = (): string =>
  process.env.DATABASE_URL ??
  ((): never => {
    throw new Error("Missing DATABASE_URL");
  })();

export const db = new Pool({
  connectionString: getDB(),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
});
