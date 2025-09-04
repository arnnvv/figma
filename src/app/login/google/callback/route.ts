import { cookies } from "next/headers";
import { getCurrentSession } from "@/actions";
import { createSession, generateSessionToken } from "@/lib/auth";
import { appConfig } from "@/lib/config";
import {
  GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME,
  GOOGLE_OAUTH_NONCE_COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
} from "@/lib/constants";
import { google } from "@/lib/oauth";
import { ObjectParser } from "@/lib/parser";
import { globalGETRateLimit } from "@/lib/request";
import { setSessionTokenCookie } from "@/lib/session";
import { upsertUserFromGoogleProfile } from "@/lib/user";

export async function GET(request: Request): Promise<Response> {
  if (!(await globalGETRateLimit())) {
    return new Response("Too many requests", {
      status: 429,
    });
  }

  const { session } = await getCurrentSession();
  if (session !== null) {
    return Response.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const c = await cookies();
  const storedState = c.get(GOOGLE_OAUTH_STATE_COOKIE_NAME)?.value ?? null;
  const codeVerifier =
    c.get(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME)?.value ?? null;
  const nonce = c.get(GOOGLE_OAUTH_NONCE_COOKIE_NAME)?.value ?? null;

  c.delete({
    name: GOOGLE_OAUTH_STATE_COOKIE_NAME,
    ...appConfig.oauthCookieOptions,
  });
  c.delete({
    name: GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME,
    ...appConfig.oauthCookieOptions,
  });
  c.delete({
    name: GOOGLE_OAUTH_NONCE_COOKIE_NAME,
    ...appConfig.oauthCookieOptions,
  });

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    !nonce ||
    state !== storedState
  ) {
    return new Response("Invalid OAuth state. Please try again.", {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const claims = await google.validateIdToken(tokens.idToken(), nonce);

    const claimsParser = new ObjectParser(claims);
    const googleId = claimsParser.getString("sub");
    const name = claimsParser.getString("name");
    const picture = claimsParser.getString("picture");
    const email = claimsParser.getString("email");

    const user = await upsertUserFromGoogleProfile(
      googleId,
      email,
      name,
      picture,
    );

    const sessionToken = generateSessionToken();
    const newSession = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, newSession.expires_at);

    const redirectTo =
      user.username.startsWith("google-") || user.username.startsWith("github-")
        ? "/get-username"
        : "/";

    return Response.redirect(new URL(redirectTo, request.url));
  } catch (e) {
    console.error(`OAuth callback error: ${e}`);
    return new Response("Authentication failed. Please try again.", {
      status: 500,
    });
  }
}
