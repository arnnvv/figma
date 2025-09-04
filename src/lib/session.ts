import { cookies } from "next/headers";
import { appConfig } from "./config";
import { SESSION_COOKIE_NAME } from "./constants";

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    ...appConfig.oauthCookieOptions,
    expires: expiresAt,
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    ...appConfig.oauthCookieOptions,
    maxAge: 0,
  });
}
