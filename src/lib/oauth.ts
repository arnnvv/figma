import { GitHub, Google } from "arctic";

const getOAuthCredentials = (provider: "google" | "github") => {
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
