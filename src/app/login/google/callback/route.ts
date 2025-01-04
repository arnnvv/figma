import { cookies } from "next/headers";
import { decodeIdToken, google } from "@/lib/oauth";
import { createUserGoogle, getUserFromGmail } from "@/lib/user";
import { createSession, generateSessionToken } from "@/lib/auth";
import { setSessionTokenCookie } from "@/lib/session";
import { getCurrentSession } from "@/actions";
import { globalGETRateLimit } from "@/lib/request";
import { ObjectParser } from "@/lib/oauth-parser";
import type { OAuth2Tokens } from "@/lib/oauth-token";

export async function GET(request: Request): Promise<Response> {
  if (!globalGETRateLimit()) {
    return new Response("Too many requests", {
      status: 429,
    });
  }

  const { session } = await getCurrentSession();
  if (session !== null)
    return new Response("Logged In", {
      status: 302,
      headers: {
        Location: "/",
      },
    });

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState =
    (await cookies()).get("google_oauth_state")?.value ?? null;
  const codeVerifier =
    (await cookies()).get("google_code_verifier")?.value ?? null;
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  const claims = decodeIdToken(tokens.idToken());
  const claimsParser = new ObjectParser(claims);

  //const name = claimsParser.getString("name");
  const picture = claimsParser.getString("picture");
  const email = claimsParser.getString("email");

  const existingUser = await getUserFromGmail(email);
  if (existingUser !== null) {
    const sessionToken = generateSessionToken();
    const session2 = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session2.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const user = await createUserGoogle(email, picture);
  const sessionToken = generateSessionToken();
  const session2 = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session2.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/get-username",
    },
  });
}
