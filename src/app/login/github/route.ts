import { getCurrentSession } from "@/actions";
import { generateState, github } from "@/lib/oauth";
import { globalGETRateLimit } from "@/lib/request";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  if (!globalGETRateLimit())
    return new Response("Too many requests", {
      status: 429,
    });

  const { session } = await getCurrentSession();
  if (session !== null)
    return new Response("Logged In", {
      status: 302,
      headers: {
        Location: "/",
      },
    });

  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  (await cookies()).set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
