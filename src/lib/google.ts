import { CodeChallengeMethod, OAuth2Client } from "./oauth-client";
import type { OAuth2Tokens } from "./oauth-token";

const tokenEndpoint = "https://oauth2.googleapis.com/token";

export class Google {
  private client: OAuth2Client;

  constructor(clientId: string, clientSecret: string, redirectURI: string) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectURI);
  }

  public async createAuthorizationURL(
    state: string,
    codeVerifier: string,
    scopes: string[],
  ): Promise<URL> {
    const url = await this.client.createAuthorizationURLWithPKCE(
      "https://accounts.google.com/o/oauth2/v2/auth",
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      scopes,
    );
    return url;
  }

  public async validateAuthorizationCode(
    code: string,
    codeVerifier: string,
  ): Promise<OAuth2Tokens> {
    const tokens = await this.client.validateAuthorizationCode(
      tokenEndpoint,
      code,
      codeVerifier,
    );
    return tokens;
  }

  public async refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens> {
    const tokens = await this.client.refreshAccessToken(
      tokenEndpoint,
      refreshToken,
      [],
    );
    return tokens;
  }

  public async revokeToken(token: string): Promise<void> {
    await this.client.revokeToken(
      "https://oauth2.googleapis.com/revoke",
      token,
    );
  }
}
