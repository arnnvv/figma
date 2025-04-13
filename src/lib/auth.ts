import { db } from "./db";
import { sha256 } from "./sha";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "./encoding";
import type { Session, User } from "./db/types";
import type { QueryResult } from "pg";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(
    await sha256(new TextEncoder().encode(token)),
  );
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const sql = `
    INSERT INTO figma_sessions (id, user_id, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, expires_at
  `;
  const params = [sessionId, userId, expiresAt];

  try {
    const result: QueryResult<Session> = await db.query(sql, params);
    if (result.rowCount === 0 || !result.rows[0]) {
      throw new Error("Session insertion failed, no session returned.");
    }
    // The returned row directly matches the Session type (id, user_id, expires_at)
    return result.rows[0];
  } catch (error) {
    console.error(`Error creating session for user (${userId}):`, error);
    throw error;
  }
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(
    await sha256(new TextEncoder().encode(token)),
  );
  const sql = `
    SELECT
        s.id        AS "session_id",
        s.user_id   AS "session_user_id",
        s.expires_at AS "session_expires_at",
        u.id        AS "user_id",
        u.username  AS "user_username",
        u.email     AS "user_email",
        u.verified  AS "user_verified",
        u.picture   AS "user_picture"
        -- Explicitly exclude u.password
    FROM figma_sessions s
    JOIN figma_users u ON s.user_id = u.id
    WHERE s.id = $1
    LIMIT 1
  `;
  const params = [sessionId];

  try {
    type ValidationJoinResult = {
      session_id: string;
      session_user_id: number;
      session_expires_at: Date;
      user_id: number;
      user_username: string;
      user_email: string;
      user_verified: boolean;
      user_picture: string | null;
    };

    const result: QueryResult<ValidationJoinResult> = await db.query(
      sql,
      params,
    );

    if (result.rowCount === 0) {
      return { session: null, user: null };
    }

    const row = result.rows[0];

    const session: Session = {
      id: row.session_id,
      user_id: row.session_user_id,
      expires_at: row.session_expires_at,
    };

    const user: User = {
      id: row.user_id,
      username: row.user_username,
      email: row.user_email,
      verified: row.user_verified,
      picture: row.user_picture,
    };

    if (Date.now() >= session.expires_at.getTime()) {
      // Use invalidateSession directly for cleanup
      await invalidateSession(session.id);
      return { session: null, user: null };
    }

    // Check if session needs refreshing (within 15 days of expiry)
    if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
      const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      const updateSql =
        "UPDATE figma_sessions SET expires_at = $1 WHERE id = $2";
      try {
        await db.query(updateSql, [newExpiresAt, session.id]);
        session.expires_at = newExpiresAt;
      } catch (updateError) {
        console.error(
          `Error updating session expiry for session (${session.id}):`,
          updateError,
        );
      }
    }

    return { session, user };
  } catch (error) {
    console.error(
      `Error validating session token for session ID hash starting with ${sessionId.substring(0, 8)}...:`,
      error,
    );
    throw error;
  }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  const sql = "DELETE FROM figma_sessions WHERE id = $1";
  const params = [sessionId];
  try {
    const result = await db.query(sql, params);
    console.log(
      `Invalidated session ${sessionId}. Rows affected: ${result.rowCount}`,
    );
  } catch (error) {
    console.error(`Error invalidating session (${sessionId}):`, error);
    throw error;
  }
}
