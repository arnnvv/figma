import { Google } from "arctic";

const getGoogleCredentials = () => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID.length === 0
  )
    throw new Error("GOOGLE_CLIENT_ID missing.");

  if (
    !process.env.GOOGLE_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET.length === 0
  )
    throw new Error("GOOGLE_CLIENT_SECRET missing.");

  if (
    !process.env.GOOGLE_REDIRECT_URL ||
    process.env.GOOGLE_REDIRECT_URL.length === 0
  )
    throw new Error("Google Redirect URL missing");

  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectURL: process.env.GOOGLE_REDIRECT_URL,
  };
};

export const google = new Google(
  getGoogleCredentials().clientId,
  getGoogleCredentials().clientSecret,
  getGoogleCredentials().redirectURL,
);
