import {
  GITHUB_TOKEN_ENDPOINT,
  GITHUB_USER_EMAILS_ENDPOINT,
  GITHUB_USER_ENDPOINT,
} from "./constants";
import { CodeChallengeMethod, OAuth2Client } from "./oauth-client";
import type { OAuth2Tokens } from "./oauth-token";
import { ObjectParser } from "./parser";

export class GitHub {
  private client: OAuth2Client;

  constructor(clientId: string, clientSecret: string, redirectURI: string) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectURI);
  }

  public async createAuthorizationURL(
    state: string,
    codeVerifier: string,
    scopes: string[],
  ): Promise<URL> {
    return this.client.createAuthorizationURLWithPKCE(
      "https://github.com/login/oauth/authorize",
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      scopes,
    );
  }

  public async validateAuthorizationCode(
    code: string,
    codeVerifier: string,
  ): Promise<OAuth2Tokens> {
    return this.client.validateAuthorizationCode(
      GITHUB_TOKEN_ENDPOINT,
      code,
      codeVerifier,
    );
  }

  public async getUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch(GITHUB_USER_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "figma-clone-app",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user");
    }
    const data = await response.json();
    const parser = new ObjectParser(data);
    return {
      id: parser.getNumber("id"),
      login: parser.getString("login"),
      name: parser.getOptionalString("name") ?? null,
      avatar_url: parser.getString("avatar_url"),
    };
  }

  public async getEmails(accessToken: string): Promise<GitHubEmail[]> {
    const response = await fetch(GITHUB_USER_EMAILS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "figma-clone-app",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch GitHub emails");
    }
    return response.json();
  }
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
}
