import { cookies } from "next/headers";
import { getCurrentSession } from "@/actions";
import { createSession, generateSessionToken } from "@/lib/auth";
import { appConfig } from "@/lib/config";
import {
  GITHUB_OAUTH_CODE_VERIFIER_COOKIE_NAME,
  GITHUB_OAUTH_STATE_COOKIE_NAME,
} from "@/lib/constants";
import type { GitHubEmail } from "@/lib/github";
import { github } from "@/lib/oauth";
import { globalGETRateLimit } from "@/lib/request";
import { setSessionTokenCookie } from "@/lib/session";
import { upsertUserFromGitHubProfile } from "@/lib/user";

export async function GET(request: Request): Promise<Response> {
  if (!(await globalGETRateLimit())) {
    return new Response("Too many requests", { status: 429 });
  }

  const { session } = await getCurrentSession();
  if (session !== null) {
    return Response.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const c = await cookies();
  const storedState = c.get(GITHUB_OAUTH_STATE_COOKIE_NAME)?.value ?? null;
  const codeVerifier =
    c.get(GITHUB_OAUTH_CODE_VERIFIER_COOKIE_NAME)?.value ?? null;

  c.delete({
    name: GITHUB_OAUTH_STATE_COOKIE_NAME,
    ...appConfig.oauthCookieOptions,
  });
  c.delete({
    name: GITHUB_OAUTH_CODE_VERIFIER_COOKIE_NAME,
    ...appConfig.oauthCookieOptions,
  });

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    return new Response("Invalid OAuth state. Please try again.", {
      status: 400,
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const githubUser = await github.getUser(accessToken);
    const githubEmails = await github.getEmails(accessToken);

    const primaryEmail = githubEmails.find(
      (email: GitHubEmail) => email.primary && email.verified,
    );

    if (!primaryEmail) {
      return new Response("Please verify your primary GitHub email.", {
        status: 400,
      });
    }

    const user = await upsertUserFromGitHubProfile(
      githubUser.id.toString(),
      primaryEmail.email,
      githubUser.name ?? githubUser.login,
      githubUser.avatar_url,
    );

    const sessionToken = generateSessionToken();
    const newSession = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, newSession.expires_at);

    const redirectTo =
      user.username.startsWith("github-") || user.username.startsWith("google-")
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
