import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is not set.`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === "production";

export const appConfig = {
  google: {
    clientId: getEnvVar("GOOGLE_CLIENT_ID"),
    clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    redirectUrl: getEnvVar("GOOGLE_REDIRECT_URL"),
  },
  github: {
    clientId: getEnvVar("GITHUB_CLIENT_ID"),
    clientSecret: getEnvVar("GITHUB_CLIENT_SECRET"),
    redirectUrl: getEnvVar("GITHUB_REDIRECT_URL"),
  },
  database: {
    connectionString: getEnvVar("DATABASE_URL"),
  },
  email: {
    smtpHost: getEnvVar("SMTP_HOST"),
    smtpPort: Number(getEnvVar("SMTP_PORT")),
    user: getEnvVar("EMAIL"),
    pass: getEnvVar("EMAIL_PASS"),
  },
  nodeEnv: process.env.NODE_ENV || "development",
  oauthCookieOptions: {
    path: "/",
    secure: isProduction,
    httpOnly: true,
    sameSite: "lax",
  } as const satisfies Partial<ResponseCookie>,
};
