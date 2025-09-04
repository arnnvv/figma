import { PROVIDER } from "./constants";
import {
  findUserByEmail_Raw,
  findUserByGithubId_Raw,
  findUserByGoogleId_Raw,
  insertUser_Raw,
  updateUserLinkGitHub_Raw,
  updateUserLinkGoogle_Raw,
  updateUserPictureById_Raw,
} from "./db/inlinequeries";
import type { NewUser, User } from "./db/types";

type Provider = (typeof PROVIDER)[keyof typeof PROVIDER];

type Profile = {
  providerId: string;
  email: string;
  username: string;
  picture: string;
};

async function upsertUser(provider: Provider, profile: Profile): Promise<User> {
  const findUserByProviderId =
    provider === "google" ? findUserByGoogleId_Raw : findUserByGithubId_Raw;

  const userByProviderId = await findUserByProviderId(profile.providerId);

  if (userByProviderId) {
    if (userByProviderId.picture !== profile.picture) {
      await updateUserPictureById_Raw(userByProviderId.id, profile.picture);
      userByProviderId.picture = profile.picture;
    }
    return userByProviderId;
  }

  const userByEmail = await findUserByEmail_Raw(profile.email);

  if (userByEmail) {
    const linkUser =
      provider === "google"
        ? updateUserLinkGoogle_Raw
        : updateUserLinkGitHub_Raw;
    const linkedUser = await linkUser(userByEmail.id, profile.providerId);
    if (linkedUser.picture !== profile.picture) {
      await updateUserPictureById_Raw(linkedUser.id, profile.picture);
      linkedUser.picture = profile.picture;
    }
    return linkedUser;
  }

  const newUserValues: NewUser = {
    email: profile.email,
    username: `${provider}-${profile.username}`,
    picture: profile.picture,
    verified: true,
  };

  if (provider === "google") {
    newUserValues.google_id = profile.providerId;
  } else {
    newUserValues.github_id = profile.providerId;
  }

  const insertedResult = await insertUser_Raw(newUserValues);
  const newUser = { ...newUserValues, id: insertedResult.id };

  return newUser as User;
}

export async function upsertUserFromGoogleProfile(
  googleId: string,
  email: string,
  name: string,
  picture: string,
): Promise<User> {
  try {
    const username = name.split(" ")[0] || "user";
    return await upsertUser(PROVIDER.GOOGLE, {
      providerId: googleId,
      email,
      username,
      picture,
    });
  } catch (error) {
    console.error(`Error in upsertUserFromGoogleProfile: ${error}`);
    throw new Error("Could not create or update user profile from Google.");
  }
}

export async function upsertUserFromGitHubProfile(
  githubId: string,
  email: string,
  name: string,
  picture: string,
): Promise<User> {
  try {
    return await upsertUser(PROVIDER.GITHUB, {
      providerId: githubId,
      email,
      username: name,
      picture,
    });
  } catch (error) {
    console.error(`Error in upsertUserFromGitHubProfile: ${error}`);
    throw new Error("Could not create or update user profile from GitHub.");
  }
}
