import type { QueryResult } from "pg";
import type { User } from "./db/types";
import { generateRandomPassword, hashPassword } from "./password";
import { db } from "./db";

const USER_COLUMNS_NO_PASSWORD = "id, username, email, verified, picture";

export async function createUserGoogle(
  email: string,
  picture: string,
): Promise<User> {
  const googleUsername = `google-${email}`;
  let hashedPassword;
  try {
    hashedPassword = await hashPassword(generateRandomPassword(10));
  } catch (hashError) {
    console.error(
      "Error hashing password during Google user creation:",
      hashError,
    );
    throw new Error("Failed to prepare user creation.");
  }

  const insertSql = `INSERT INTO figma_users (username, email, password, picture, verified)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
  const insertParams = [googleUsername, email, hashedPassword, picture, true];

  try {
    const result: QueryResult<User> = await db.query(insertSql, insertParams);
    if (result.rowCount! > 0 && result.rows[0]) {
      return result.rows[0];
    } else {
      throw new Error("Google user insertion failed, no user returned.");
    }
  } catch (error) {
    if (error instanceof Error && (error as any).code === "23505") {
      console.warn(
        `Attempted to insert existing Google user (email: ${email}), checking for picture update.`,
      );
      const selectSql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE email = $1 LIMIT 1`;
      try {
        const existingUserResult: QueryResult<User> = await db.query(
          selectSql,
          [email],
        );
        if (existingUserResult.rowCount! > 0 && existingUserResult.rows[0]) {
          const user = existingUserResult.rows[0];
          if (user.picture === null) {
            console.log(
              `Updating picture for existing Google user (email: ${email})`,
            );
            const updateSql = `UPDATE figma_users SET picture = $1
                      WHERE email = $2
                      RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
            const updateResult: QueryResult<User> = await db.query(updateSql, [
              picture,
              email,
            ]);
            if (updateResult.rowCount! > 0 && updateResult.rows[0]) {
              return updateResult.rows[0];
            } else {
              console.error(
                `Failed to update picture for existing Google user (email: ${email})`,
              );
              return user;
            }
          }
          return user;
        } else {
          console.error(
            `Unique constraint error for email ${email}, but failed to fetch existing user.`,
          );
          throw new Error(
            `Failed to resolve user creation conflict for email: ${email}`,
          );
        }
      } catch (fetchError) {
        console.error(
          `Error fetching/updating existing Google user (email: ${email}) after unique constraint error:`,
          fetchError,
        );
        throw fetchError;
      }
    }
    console.error(`Error creating Google user (email: ${email}):`, error);
    throw error;
  }
}

export async function getUserFromGmail(email: string): Promise<User | null> {
  const googleUsername = `google-${email}`;
  const sql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE username = $1 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [googleUsername]);
    return result.rowCount! > 0 ? result.rows[0] : null; // Non-null assertion
  } catch (error) {
    console.error(
      `Error fetching user by Google username (${googleUsername}):`,
      error,
    );
    throw error;
  }
}

export async function createUserGithub(
  githubId: number,
  email: string,
  username: string,
): Promise<User> {
  const githubPrefixedUsername = `github-${username}`;
  const pictureUrl = `https://avatars.githubusercontent.com/u/${githubId}`;
  let hashedPassword;
  try {
    hashedPassword = await hashPassword(generateRandomPassword(10));
  } catch (hashError) {
    console.error(
      "Error hashing password during GitHub user creation:",
      hashError,
    );
    throw new Error("Failed to prepare user creation.");
  }

  const insertSql = `INSERT INTO figma_users (username, email, password, picture, verified)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
  const insertParams = [
    githubPrefixedUsername,
    email,
    hashedPassword,
    pictureUrl,
    true,
  ];

  try {
    const result: QueryResult<User> = await db.query(insertSql, insertParams);
    if (result.rowCount! > 0 && result.rows[0]) {
      // Non-null assertion
      return result.rows[0];
    } else {
      throw new Error("GitHub user insertion failed, no user returned.");
    }
  } catch (error) {
    if (error instanceof Error && (error as any).code === "23505") {
      console.warn(
        `Attempted to insert existing GitHub user (email: ${email}), checking for picture update.`,
      );
      const selectSql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE email = $1 LIMIT 1`;
      try {
        const existingUserResult: QueryResult<User> = await db.query(
          selectSql,
          [email],
        );
        if (existingUserResult.rowCount! > 0 && existingUserResult.rows[0]) {
          const user = existingUserResult.rows[0];
          if (user.picture === null || user.picture !== pictureUrl) {
            console.log(
              `Updating picture for existing GitHub user (email: ${email})`,
            );
            const updateSql = `UPDATE figma_users SET picture = $1, username = $2
                      WHERE email = $3
                      RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
            const updateResult: QueryResult<User> = await db.query(updateSql, [
              pictureUrl,
              githubPrefixedUsername,
              email,
            ]);
            if (updateResult.rowCount! > 0 && updateResult.rows[0]) {
              return updateResult.rows[0];
            } else {
              console.error(
                `Failed to update picture/username for existing GitHub user (email: ${email})`,
              );
              return user;
            }
          }
          return user;
        } else {
          console.error(
            `Unique constraint error for email ${email}, but failed to fetch existing user.`,
          );
          throw new Error(
            `Failed to resolve user creation conflict for email: ${email}`,
          );
        }
      } catch (fetchError) {
        console.error(
          `Error fetching/updating existing GitHub user (email: ${email}) after unique constraint error:`,
          fetchError,
        );
        throw fetchError;
      }
    }
    console.error(`Error creating GitHub user (email: ${email}):`, error);
    throw error;
  }
}

export async function getUserFromGitHubId(
  githubId: number,
): Promise<User | null> {
  const pictureUrl = `https://avatars.githubusercontent.com/u/${githubId}`;
  const sql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE picture = $1 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [pictureUrl]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(
      `Error fetching user by GitHub picture URL (${pictureUrl}):`,
      error,
    );
    throw error;
  }
}
