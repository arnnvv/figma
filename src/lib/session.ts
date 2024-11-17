import { cookies, type UnsafeUnwrappedCookies } from "next/headers";

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  (cookies() as unknown as UnsafeUnwrappedCookies).set("session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(): void {
  (cookies() as unknown as UnsafeUnwrappedCookies).set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}
