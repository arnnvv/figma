import {
  decodeBase64urlIgnorePadding,
  encodeBase64urlNoPadding,
} from "./encoding";
import { GitHub } from "./github";
import { Google } from "./google";

export function generateState(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return encodeBase64urlNoPadding(randomValues);
}

export function decodeIdToken(idToken: string): object {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid Token");
    }
    let jsonPayload: string;
    try {
      jsonPayload = new TextDecoder().decode(
        decodeBase64urlIgnorePadding(parts[1]),
      );
    } catch {
      throw new Error("Invalid Token: Invalid base64url encoding");
    }
    let payload: unknown;
    try {
      payload = JSON.parse(jsonPayload);
    } catch {
      throw new Error("Invalid Token: Invalid JSON encoding");
    }
    if (typeof payload !== "object" || payload === null) {
      throw new Error("Invalid Token: Invalid payload");
    }
    return payload as object;
  } catch (e) {
    throw new Error("Invalid ID token", {
      cause: e,
    });
  }
}

const getOAuthCredentials = (
  provider: "google" | "github",
): {
  clientId: string;
  clientSecret: string;
  redirectURL: string;
} => {
  const providerUpperCase = provider.toUpperCase();
  const clientIdEnv = `${providerUpperCase}_CLIENT_ID`;
  const clientSecretEnv = `${providerUpperCase}_CLIENT_SECRET`;
  const redirectUrlEnv = `${providerUpperCase}_REDIRECT_URL`;

  if (!process.env[clientIdEnv] || process.env[clientIdEnv].length === 0)
    throw new Error(`${providerUpperCase}_CLIENT_ID missing.`);

  if (
    !process.env[clientSecretEnv] ||
    process.env[clientSecretEnv].length === 0
  )
    throw new Error(`${providerUpperCase}_CLIENT_SECRET missing.`);

  if (!process.env[redirectUrlEnv] || process.env[redirectUrlEnv].length === 0)
    throw new Error(`${providerUpperCase}_REDIRECT_URL missing.`);

  return {
    clientId: process.env[clientIdEnv],
    clientSecret: process.env[clientSecretEnv],
    redirectURL: process.env[redirectUrlEnv],
  };
};

export const google = new Google(
  getOAuthCredentials("google").clientId,
  getOAuthCredentials("google").clientSecret,
  getOAuthCredentials("google").redirectURL,
);

export const github = new GitHub(
  getOAuthCredentials("github").clientId,
  getOAuthCredentials("github").clientSecret,
  getOAuthCredentials("github").redirectURL,
);
