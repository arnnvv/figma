import type { QueryResult } from "pg";
import type {
  User,
  Session,
  EmailVerificationRequest,
  Room,
  EditAccess,
  NewUser,
  NewSession,
  NewEmailVerificationRequest,
  NewRoom,
  NewEditAccess,
  SessionValidationResultRaw,
  EditAccessRequestWithRoomOwner,
  EditableRoomInfo,
  EditAccessStatus,
} from "./types";
import { db } from ".";

const USER_COLUMNS_NO_PASSWORD = "id, username, email, verified, picture";

export async function findUserByEmail_Raw(email: string): Promise<User | null> {
  const sql = `SELECT id, username, email, password, verified, picture FROM figma_users WHERE email = $1 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [email]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error finding user by email (${email}):`, error);
    throw error;
  }
}

export async function findUserByUsername_Raw(
  username: string,
): Promise<User | null> {
  const sql = `SELECT id, username, email, verified, picture FROM figma_users WHERE username = $1 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [username]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error finding user by username (${username}):`, error);
    throw error;
  }
}

export async function findUserByEmailOrUsername_Raw(
  email: string,
  username: string,
): Promise<User | null> {
  // Select password here as it might be needed for login/signup checks before hashing/verification
  const sql = `SELECT id, username, email, password, verified, picture FROM figma_users WHERE email = $1 OR username = $2 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [email, username]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(
      `Error finding user by email (${email}) or username (${username}):`,
      error,
    );
    throw error;
  }
}

export async function findUserById_Raw(userId: number): Promise<User | null> {
  const sql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE id = $1 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [userId]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error finding user by ID (${userId}):`, error);
    throw error;
  }
}

export async function findUserByPicture_Raw(
  pictureUrl: string,
): Promise<User | null> {
  const sql = `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM figma_users WHERE picture = $1 LIMIT 1`;
  try {
    const result: QueryResult<User> = await db.query(sql, [pictureUrl]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error finding user by picture (${pictureUrl}):`, error);
    throw error;
  }
}

export async function insertUser_Raw(
  newUser: NewUser,
): Promise<{ id: number }> {
  const sql =
    "INSERT INTO figma_users (username, email, password, verified, picture) VALUES ($1, $2, $3, $4, $5) RETURNING id";
  const verified = newUser.verified ?? false;
  const params = [
    newUser.username,
    newUser.email,
    newUser.password,
    verified,
    newUser.picture ?? null,
  ];
  try {
    const result: QueryResult<{ id: number }> = await db.query(sql, params);
    if (result.rowCount! === 0 || !result.rows[0]?.id) {
      throw new Error("User insertion failed, no ID returned.");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting user:", newUser.email, error);
    if (error instanceof Error && (error as any).code === "23505") {
      throw new Error("Username or Email already exists.");
    }
    throw error;
  }
}

export async function updateUserVerification_Raw(
  userId: number,
  verified: boolean,
): Promise<number> {
  const sql = "UPDATE figma_users SET verified = $1 WHERE id = $2";
  try {
    const result = await db.query(sql, [verified, userId]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error updating verification for user (${userId}):`, error);
    throw error;
  }
}

export async function updateUserPasswordByEmail_Raw(
  email: string,
  hashedPassword: string,
): Promise<number> {
  const sql = "UPDATE figma_users SET password = $1 WHERE email = $2";
  try {
    const result = await db.query(sql, [hashedPassword, email]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error updating password for email (${email}):`, error);
    throw error;
  }
}

export async function updateUserUsernameByEmail_Raw(
  email: string,
  newUsername: string,
): Promise<User> {
  const sql = `UPDATE figma_users SET username = $1 WHERE email = $2 RETURNING ${USER_COLUMNS_NO_PASSWORD}`;
  try {
    const result: QueryResult<User> = await db.query(sql, [newUsername, email]);
    if (result.rowCount! === 0 || !result.rows[0]) {
      throw new Error("Username update failed or user not found.");
    }
    return result.rows[0];
  } catch (error) {
    console.error(
      `Error updating username for email (${email}) to (${newUsername}):`,
      error,
    );
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
  try {
    const result = await db.query(sql, [pictureUrl, userId]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error updating picture for user (${userId}):`, error);
    throw error;
  }
}

// --- Session Queries ---

export async function findSessionWithUserById_Raw(
  sessionId: string,
): Promise<SessionValidationResultRaw> {
  const sql = `
        SELECT
            s.id as session_id, s.user_id as session_user_id, s.expires_at as session_expires_at,
            u.id as user_id, u.username, u.email, u.verified, u.picture
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
    };
    const result: QueryResult<JoinResult> = await db.query(sql, [sessionId]);

    if (result.rowCount! === 0) {
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
  try {
    const result: QueryResult<Session> = await db.query(sql, [
      newSession.id,
      newSession.user_id,
      newSession.expires_at,
    ]);
    if (result.rowCount! === 0 || !result.rows[0]) {
      throw new Error("Session insertion failed.");
    }
    return result.rows[0];
  } catch (error) {
    console.error(
      `Error inserting session for user (${newSession.user_id}):`,
      error,
    );
    throw error;
  }
}

export async function deleteSessionById_Raw(
  sessionId: string,
): Promise<number> {
  const sql = "DELETE FROM figma_sessions WHERE id = $1";
  try {
    const result = await db.query(sql, [sessionId]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error deleting session (${sessionId}):`, error);
    throw error;
  }
}

export async function updateSessionExpiry_Raw(
  sessionId: string,
  newExpiresAt: Date,
): Promise<number> {
  const sql = "UPDATE figma_sessions SET expires_at = $1 WHERE id = $2";
  try {
    const result = await db.query(sql, [newExpiresAt, sessionId]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error updating session expiry (${sessionId}):`, error);
    throw error;
  }
}

// --- Email Verification Queries ---

export async function findEmailVerificationByUserIdAndCode_Raw(
  userId: number,
  code: string,
): Promise<EmailVerificationRequest | null> {
  const sql =
    "SELECT id, user_id, email, code, expires_at FROM figma_email_verification_request WHERE user_id = $1 AND code = $2 LIMIT 1";
  try {
    const result: QueryResult<EmailVerificationRequest> = await db.query(sql, [
      userId,
      code,
    ]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(
      `Error finding email verification for user (${userId}):`,
      error,
    );
    throw error;
  }
}

export async function deleteEmailVerificationByUserId_Raw(
  userId: number,
): Promise<number> {
  const sql = "DELETE FROM figma_email_verification_request WHERE user_id = $1";
  try {
    const result = await db.query(sql, [userId]);
    return result.rowCount!;
  } catch (error) {
    console.error(
      `Error deleting email verification for user (${userId}):`,
      error,
    );
    throw error;
  }
}

export async function insertEmailVerification_Raw(
  newRequest: NewEmailVerificationRequest,
): Promise<{ id: number }> {
  const sql =
    "INSERT INTO figma_email_verification_request (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4) RETURNING id";
  try {
    const result: QueryResult<{ id: number }> = await db.query(sql, [
      newRequest.user_id,
      newRequest.email,
      newRequest.code,
      newRequest.expires_at,
    ]);
    if (result.rowCount! === 0 || !result.rows[0]?.id) {
      throw new Error("Email verification request insertion failed.");
    }
    return result.rows[0];
  } catch (error) {
    console.error(
      `Error inserting email verification for user (${newRequest.user_id}):`,
      error,
    );
    throw error;
  }
}

// --- Room Queries ---

export async function findRoomById_Raw(roomId: string): Promise<Room | null> {
  const sql = "SELECT id, owner_id FROM figma_rooms WHERE id = $1 LIMIT 1";
  try {
    const result: QueryResult<Room> = await db.query(sql, [roomId]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error finding room by ID (${roomId}):`, error);
    throw error;
  }
}

export async function findRoomsByOwnerId_Raw(ownerId: number): Promise<Room[]> {
  const sql = "SELECT id, owner_id FROM figma_rooms WHERE owner_id = $1";
  try {
    const result: QueryResult<Room> = await db.query(sql, [ownerId]);
    return result.rows;
  } catch (error) {
    console.error(`Error finding rooms by owner ID (${ownerId}):`, error);
    throw error;
  }
}

export async function insertRoom_Raw(newRoom: NewRoom): Promise<Room> {
  const sql =
    "INSERT INTO figma_rooms (id, owner_id) VALUES ($1, $2) RETURNING id, owner_id";
  try {
    const result: QueryResult<Room> = await db.query(sql, [
      newRoom.id,
      newRoom.owner_id,
    ]);
    if (result.rowCount! === 0 || !result.rows[0]) {
      throw new Error("Room insertion failed.");
    }
    return result.rows[0];
  } catch (error) {
    console.error(
      `Error inserting room (${newRoom.id}) for owner (${newRoom.owner_id}):`,
      error,
    );
    throw error;
  }
}

export async function deleteRoomById_Raw(roomId: string): Promise<number> {
  const sql = "DELETE FROM figma_rooms WHERE id = $1";
  try {
    const result = await db.query(sql, [roomId]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error deleting room (${roomId}):`, error);
    throw error;
  }
}

export async function getMaxRoomId_Raw(): Promise<number> {
  const sql = "SELECT MAX(CAST(id AS INT)) as max_id FROM figma_rooms";
  try {
    const result: QueryResult<{ max_id: number | null }> = await db.query(sql);
    return result.rows[0]?.max_id ?? 0;
  } catch (error) {
    console.error("Error fetching max room ID:", error);
    return 0; // Return default on error
  }
}

// --- Edit Access Queries ---

export async function findEditAccess_Raw(
  requesterId: number,
  roomId: string,
): Promise<EditAccess | null> {
  const sql =
    "SELECT id, requester_id, room_id_requested_for, status FROM figma_edit_access WHERE requester_id = $1 AND room_id_requested_for = $2 LIMIT 1";
  try {
    const result: QueryResult<EditAccess> = await db.query(sql, [
      requesterId,
      roomId,
    ]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(
      `Error finding edit access for requester (${requesterId}) and room (${roomId}):`,
      error,
    );
    throw error;
  }
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
  try {
    const result: QueryResult<EditAccess> = await db.query(sql, [
      requesterId,
      roomId,
    ]);
    return result.rowCount! > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(
      `Error finding pending/accepted edit access for requester (${requesterId}) and room (${roomId}):`,
      error,
    );
    throw error;
  }
}

export async function insertEditAccess_Raw(
  newAccess: NewEditAccess,
): Promise<EditAccess> {
  const sql =
    "INSERT INTO figma_edit_access (requester_id, room_id_requested_for, status) VALUES ($1, $2, $3) RETURNING id, requester_id, room_id_requested_for, status";
  try {
    const result: QueryResult<EditAccess> = await db.query(sql, [
      newAccess.requester_id,
      newAccess.room_id_requested_for,
      newAccess.status,
    ]);
    if (result.rowCount! === 0 || !result.rows[0]) {
      throw new Error("Edit access insertion failed.");
    }
    return result.rows[0];
  } catch (error) {
    console.error(
      `Error inserting edit access for requester (${newAccess.requester_id}) room (${newAccess.room_id_requested_for}):`,
      error,
    );
    throw error;
  }
}

export async function updateEditAccessStatus_Raw(
  accessId: number,
  newStatus: EditAccessStatus,
): Promise<number> {
  const sql = "UPDATE figma_edit_access SET status = $1 WHERE id = $2";
  try {
    const result = await db.query(sql, [newStatus, accessId]);
    return result.rowCount!;
  } catch (error) {
    console.error(
      `Error updating edit access status for ID (${accessId}) to (${newStatus}):`,
      error,
    );
    throw error;
  }
}

export async function deleteEditAccessByRoomId_Raw(
  roomId: string,
): Promise<number> {
  const sql = "DELETE FROM figma_edit_access WHERE room_id_requested_for = $1";
  try {
    const result = await db.query(sql, [roomId]);
    return result.rowCount!;
  } catch (error) {
    console.error(`Error deleting edit access for room (${roomId}):`, error);
    throw error;
  }
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
  try {
    const result: QueryResult<EditableRoomInfo> = await db.query(sql, [userId]);
    return result.rows;
  } catch (error) {
    console.error(`Error finding editable rooms for user (${userId}):`, error);
    throw error;
  }
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
  try {
    const result: QueryResult<EditAccessRequestWithRoomOwner> = await db.query(
      sql,
      [ownerId],
    );
    return result.rows;
  } catch (error) {
    console.error(
      `Error finding pending requests for owner (${ownerId}):`,
      error,
    );
    throw error;
  }
}

export const getNameFromId = async (userId: number): Promise<string | null> => {
  const sql = "SELECT username FROM figma_users WHERE id = $1 LIMIT 1";
  const params = [userId];

  try {
    type UsernameResult = { username: string };
    const result: QueryResult<UsernameResult> = await db.query(sql, params);

    if (result.rowCount! > 0 && result.rows[0]?.username) {
      return result.rows[0].username;
    } else {
      console.log(`No user found with ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching username for ID ${userId} via db.query:`,
      error,
    );
    return null;
  }
};
