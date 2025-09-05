import type { QueryResult } from "pg";
import { db } from ".";
import type {
  EditAccess,
  EditAccessRequestWithRoomOwner,
  EditAccessStatus,
  EditableRoomInfo,
  EmailVerificationRequest,
  NewEditAccess,
  NewEmailVerificationRequest,
  NewRoom,
  NewSession,
  NewUser,
  Room,
  Session,
  SessionValidationResultRaw,
  User,
} from "./types";

const USER_COLUMNS_NO_PASSWORD =
  "id, username, email, verified, picture, google_id, github_id";

export async function findUserByEmail_Raw(email: string): Promise<User | null> {
  const sql = `SELECT id, username, email, password_hash, verified, picture, google_id, github_id FROM figma_users WHERE email = $1 LIMIT 1`;
  const result: QueryResult<User> = await db.query(sql, [email]);
  return result.rowCount ? result.rows[0] : null;
}

export async function findUserByEmailOrUsername_Raw(
  email: string,
  username: string,
): Promise<User | null> {
  const sql = `SELECT id, username, email, password_hash, verified, picture, google_id, github_id FROM figma_users WHERE email = $1 OR username = $2 LIMIT 1`;
  const result: QueryResult<User> = await db.query(sql, [email, username]);
  return result.rowCount ? result.rows[0] : null;
}

export async function findUserByGoogleId_Raw(
  googleId: string,
): Promise<User | null> {
  const sql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE google_id = $1 LIMIT 1`;
  const result: QueryResult<User> = await db.query(sql, [googleId]);
  return result.rowCount ? result.rows[0] : null;
}

export async function findUserByGithubId_Raw(
  githubId: string,
): Promise<User | null> {
  const sql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE github_id = $1 LIMIT 1`;
  const result: QueryResult<User> = await db.query(sql, [githubId]);
  return result.rowCount ? result.rows[0] : null;
}

export async function insertUser_Raw(
  newUser: NewUser,
): Promise<{ id: number }> {
  const sql =
    "INSERT INTO figma_users (username, email, password_hash, verified, picture, google_id, github_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
  const params = [
    newUser.username,
    newUser.email,
    newUser.password_hash ?? null,
    newUser.verified ?? false,
    newUser.picture ?? null,
    newUser.google_id ?? null,
    newUser.github_id ?? null,
  ];
  const result: QueryResult<{ id: number }> = await db.query(sql, params);
  if (!result.rows[0]?.id)
    throw new Error("User insertion failed, no ID returned.");
  return result.rows[0];
}

export async function updateUserLinkGoogle_Raw(
  userId: number,
  googleId: string,
): Promise<User> {
  const sql = `UPDATE figma_users SET google_id = $1 WHERE id = $2 RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
  const result: QueryResult<User> = await db.query(sql, [googleId, userId]);
  if (!result.rows[0]) throw new Error("Failed to link Google account.");
  return result.rows[0];
}

export async function updateUserLinkGitHub_Raw(
  userId: number,
  githubId: string,
): Promise<User> {
  const sql = `UPDATE figma_users SET github_id = $1 WHERE id = $2 RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
  const result: QueryResult<User> = await db.query(sql, [githubId, userId]);
  if (!result.rows[0]) throw new Error("Failed to link GitHub account.");
  return result.rows[0];
}

export async function updateUserVerification_Raw(
  userId: number,
  verified: boolean,
): Promise<number> {
  const sql = "UPDATE figma_users SET verified = $1 WHERE id = $2";
  const result = await db.query(sql, [verified, userId]);
  return result.rowCount ?? 0;
}

export async function updateUserPasswordByEmail_Raw(
  email: string,
  hashedPassword: string,
): Promise<number> {
  const sql = "UPDATE figma_users SET password_hash = $1 WHERE email = $2";
  const result = await db.query(sql, [hashedPassword, email]);
  return result.rowCount ?? 0;
}

export async function updateUserUsernameByEmail_Raw(
  email: string,
  newUsername: string,
): Promise<User> {
  const sql = `UPDATE figma_users SET username = $1 WHERE email = $2 RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
  try {
    const result: QueryResult<User> = await db.query(sql, [newUsername, email]);
    if (!result.rows[0])
      throw new Error("Username update failed or user not found.");
    return result.rows[0];
  } catch (error) {
    if (error instanceof Error && (error as any).code === "23505") {
      throw new Error("Username already taken.");
    }
    throw error;
  }
}

export async function updateUserPictureById_Raw(
  userId: number,
  pictureUrl: string,
): Promise<number> {
  const sql = "UPDATE figma_users SET picture = $1 WHERE id = $2";
  const result = await db.query(sql, [pictureUrl, userId]);
  return result.rowCount ?? 0;
}

export async function findSessionWithUserById_Raw(
  sessionId: string,
): Promise<SessionValidationResultRaw> {
  const sql = `
        SELECT
            s.id as session_id, s.user_id as session_user_id, s.expires_at as session_expires_at,
            u.id as user_id, u.username, u.email, u.verified, u.picture, u.password_hash, u.google_id, u.github_id
        FROM figma_sessions s
        JOIN figma_users u ON s.user_id = u.id
        WHERE s.id = $1
        LIMIT 1
    `;
  try {
    type JoinResult = {
      session_id: string;
      session_user_id: number;
      session_expires_at: Date;
      user_id: number;
      username: string;
      email: string;
      verified: boolean;
      picture: string | null;
      password_hash: string | null;
      google_id: string | null;
      github_id: string | null;
    };
    const result: QueryResult<JoinResult> = await db.query(sql, [sessionId]);

    if (!result.rowCount) {
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
      username: row.username,
      email: row.email,
      verified: row.verified,
      picture: row.picture,
      password_hash: row.password_hash,
      google_id: row.google_id,
      github_id: row.github_id,
    };
    return { session, user };
  } catch (error) {
    console.error(`Error finding session by ID (${sessionId}):`, error);
    throw error;
  }
}

export async function insertSession_Raw(
  newSession: NewSession,
): Promise<Session> {
  const sql =
    "INSERT INTO figma_sessions (id, user_id, expires_at) VALUES ($1, $2, $3) RETURNING id, user_id, expires_at";
  const result: QueryResult<Session> = await db.query(sql, [
    newSession.id,
    newSession.user_id,
    newSession.expires_at,
  ]);
  if (!result.rows[0]) throw new Error("Session insertion failed.");
  return result.rows[0];
}

export async function deleteSessionById_Raw(
  sessionId: string,
): Promise<number> {
  const sql = "DELETE FROM figma_sessions WHERE id = $1";
  const result = await db.query(sql, [sessionId]);
  return result.rowCount ?? 0;
}

export async function updateSessionExpiry_Raw(
  sessionId: string,
  newExpiresAt: Date,
): Promise<number> {
  const sql = "UPDATE figma_sessions SET expires_at = $1 WHERE id = $2";
  const result = await db.query(sql, [newExpiresAt, sessionId]);
  return result.rowCount ?? 0;
}

export async function findEmailVerificationByUserIdAndCode_Raw(
  userId: number,
  code: string,
): Promise<EmailVerificationRequest | null> {
  const sql =
    "SELECT id, user_id, email, code, expires_at FROM figma_email_verification_request WHERE user_id = $1 AND code = $2 LIMIT 1";
  const result: QueryResult<EmailVerificationRequest> = await db.query(sql, [
    userId,
    code,
  ]);
  return result.rowCount ? result.rows[0] : null;
}

export async function deleteEmailVerificationByUserId_Raw(
  userId: number,
): Promise<number> {
  const sql = "DELETE FROM figma_email_verification_request WHERE user_id = $1";
  const result = await db.query(sql, [userId]);
  return result.rowCount ?? 0;
}

export async function insertEmailVerification_Raw(
  newRequest: NewEmailVerificationRequest,
): Promise<{ id: number }> {
  const sql =
    "INSERT INTO figma_email_verification_request (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4) RETURNING id";
  const result: QueryResult<{ id: number }> = await db.query(sql, [
    newRequest.user_id,
    newRequest.email,
    newRequest.code,
    newRequest.expires_at,
  ]);
  if (!result.rows[0]?.id)
    throw new Error("Email verification request insertion failed.");
  return result.rows[0];
}

export async function findRoomById_Raw(roomId: string): Promise<Room | null> {
  const sql = "SELECT id, owner_id FROM figma_rooms WHERE id = $1 LIMIT 1";
  const result: QueryResult<Room> = await db.query(sql, [roomId]);
  return result.rowCount ? result.rows[0] : null;
}

export async function findRoomsByOwnerId_Raw(ownerId: number): Promise<Room[]> {
  const sql = "SELECT id, owner_id FROM figma_rooms WHERE owner_id = $1";
  const result: QueryResult<Room> = await db.query(sql, [ownerId]);
  return result.rows;
}

export async function insertRoom_Raw(newRoom: NewRoom): Promise<Room> {
  const sql =
    "INSERT INTO figma_rooms (id, owner_id) VALUES ($1, $2) RETURNING id, owner_id";
  const result: QueryResult<Room> = await db.query(sql, [
    newRoom.id,
    newRoom.owner_id,
  ]);
  if (!result.rows[0]) throw new Error("Room insertion failed.");
  return result.rows[0];
}

export async function getMaxRoomId_Raw(): Promise<number> {
  const sql = "SELECT MAX(CAST(id AS INT)) as max_id FROM figma_rooms";
  const result: QueryResult<{ max_id: number | null }> = await db.query(sql);
  return result.rows[0]?.max_id ?? 0;
}

export async function findPendingOrAcceptedEditAccess_Raw(
  requesterId: number,
  roomId: string,
): Promise<EditAccess | null> {
  const sql = `
        SELECT id, requester_id, room_id_requested_for, status
        FROM figma_edit_access
        WHERE requester_id = $1
          AND room_id_requested_for = $2
          AND status IN ('pending', 'accepted')
        LIMIT 1
    `;
  const result: QueryResult<EditAccess> = await db.query(sql, [
    requesterId,
    roomId,
  ]);
  return result.rowCount ? result.rows[0] : null;
}

export async function insertEditAccess_Raw(
  newAccess: NewEditAccess,
): Promise<EditAccess> {
  const sql =
    "INSERT INTO figma_edit_access (requester_id, room_id_requested_for, status) VALUES ($1, $2, $3) RETURNING id, requester_id, room_id_requested_for, status";
  const result: QueryResult<EditAccess> = await db.query(sql, [
    newAccess.requester_id,
    newAccess.room_id_requested_for,
    newAccess.status,
  ]);
  if (!result.rows[0]) throw new Error("Edit access insertion failed.");
  return result.rows[0];
}

export async function updateEditAccessStatus_Raw(
  accessId: number,
  newStatus: EditAccessStatus,
): Promise<number> {
  const sql = "UPDATE figma_edit_access SET status = $1 WHERE id = $2";
  const result = await db.query(sql, [newStatus, accessId]);
  return result.rowCount ?? 0;
}

export async function findEditableRoomsForUser_Raw(
  userId: number,
): Promise<EditableRoomInfo[]> {
  const sql = `
        SELECT r.id, r.owner_id
        FROM figma_rooms r
        JOIN figma_edit_access ea ON ea.room_id_requested_for = r.id
        WHERE ea.requester_id = $1 AND ea.status = 'accepted'
    `;
  const result: QueryResult<EditableRoomInfo> = await db.query(sql, [userId]);
  return result.rows;
}

export async function findPendingEditRequestsForOwner_Raw(
  ownerId: number,
): Promise<EditAccessRequestWithRoomOwner[]> {
  const sql = `
         SELECT
             ea.id,
             ea.requester_id,
             ea.room_id_requested_for AS room_id,
             ea.status,
             r.owner_id AS room_owner_id,
             u.username AS requester_username
         FROM figma_edit_access ea
         JOIN figma_rooms r ON ea.room_id_requested_for = r.id
         JOIN figma_users u ON ea.requester_id = u.id
         WHERE ea.status = 'pending' AND r.owner_id = $1
     `;
  const result: QueryResult<EditAccessRequestWithRoomOwner> = await db.query(
    sql,
    [ownerId],
  );
  return result.rows;
}

export const getNameFromId = async (userId: number): Promise<string | null> => {
  const sql = "SELECT username FROM figma_users WHERE id = $1 LIMIT 1";
  const result: QueryResult<{ username: string }> = await db.query(sql, [
    userId,
  ]);
  return result.rows[0]?.username ?? null;
};
