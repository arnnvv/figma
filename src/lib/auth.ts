import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFRESH_THRESHOLD_SECONDS,
} from "./constants";
import {
  deleteSessionById_Raw,
  findSessionWithUserById_Raw,
  insertSession_Raw,
  updateSessionExpiry_Raw,
} from "./db/inlinequeries";
import type { Session, User } from "./db/types";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "./encoding";
import { sha256 } from "./sha";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const newSessionData = {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  };
  return await insertSession_Raw(newSessionData);
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await findSessionWithUserById_Raw(sessionId);

  if (!result.session || !result.user) {
    return { session: null, user: null };
  }

  const { session, user } = result;

  if (Date.now() >= session.expires_at.getTime()) {
    await invalidateSession(session.id);
    return { session: null, user: null };
  }

  if (
    Date.now() >=
    session.expires_at.getTime() - SESSION_REFRESH_THRESHOLD_SECONDS * 1000
  ) {
    session.expires_at = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    await updateSessionExpiry_Raw(session.id, session.expires_at);
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await deleteSessionById_Raw(sessionId);
}
