import { cookies, type UnsafeUnwrappedCookies } from "next/headers";

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  ((await cookies()) as unknown as UnsafeUnwrappedCookies).set(
    "session",
    token,
    {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    },
  );
}

export async function deleteSessionTokenCookie(): Promise<void> {
  ((await cookies()) as unknown as UnsafeUnwrappedCookies).set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}
