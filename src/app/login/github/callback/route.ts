import { cookies } from "next/headers";
import { globalGETRateLimit } from "@/lib/request";
import { github } from "@/lib/oauth";
import { createSession, generateSessionToken } from "@/lib/auth";
import { setSessionTokenCookie } from "@/lib/session";
import { createUserGithub, getUserFromGitHubId } from "@/lib/user";
import { getCurrentSession } from "@/actions";
import { ObjectParser } from "@/lib/oauth-parser";
import type { OAuth2Tokens } from "@/lib/oauth-token";

export async function GET(request: Request): Promise<Response> {
  if (!(await globalGETRateLimit())) {
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
    (await cookies()).get("github_oauth_state")?.value ?? null;
  if (code === null || state === null || storedState === null) {
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
    tokens = await github.validateAuthorizationCode(code);
  } catch {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  const githubAccessToken = tokens.accessToken();

  const userRequest = new Request("https://api.github.com/user");
  userRequest.headers.set("Authorization", `Bearer ${githubAccessToken}`);
  const userResponse = await fetch(userRequest);
  const userResult: unknown = await userResponse.json();
  const userParser = new ObjectParser(userResult);

  const githubUserId = userParser.getNumber("id");
  const username = userParser.getString("login");

  const existingUser = await getUserFromGitHubId(githubUserId);
  if (existingUser !== null) {
    const sessionToken = generateSessionToken();
    const session2 = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session2.expires_at);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const emailListRequest = new Request("https://api.github.com/user/emails");
  emailListRequest.headers.set("Authorization", `Bearer ${githubAccessToken}`);
  const emailListResponse = await fetch(emailListRequest);
  const emailListResult: unknown = await emailListResponse.json();
  if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  let email: string | null = null;
  for (const emailRecord of emailListResult) {
    const emailParser = new ObjectParser(emailRecord);
    const primaryEmail = emailParser.getBoolean("primary");
    const verifiedEmail = emailParser.getBoolean("verified");
    if (primaryEmail && verifiedEmail) {
      email = emailParser.getString("email");
    }
  }
  if (email === null) {
    return new Response("Please verify your GitHub email address.", {
      status: 400,
    });
  }

  const user = await createUserGithub(githubUserId, email, username);
  const sessionToken = generateSessionToken();
  const session2 = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session2.expires_at);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/get-username",
    },
  });
}
