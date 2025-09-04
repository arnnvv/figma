import { GOOGLE_TOKEN_ENDPOINT } from "./constants";
import { CodeChallengeMethod, OAuth2Client } from "./oauth-client";
import type { OAuth2Tokens } from "./oauth-token";
import { validateIdToken } from "./token";

export class Google {
  private client: OAuth2Client;
  public validateIdToken: (idToken: string, nonce: string) => Promise<object>;

  constructor(clientId: string, clientSecret: string, redirectURI: string) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectURI);
    this.validateIdToken = (idToken: string, nonce: string) =>
      validateIdToken(idToken, this.client.clientId, nonce);
  }

  public async createAuthorizationURL(
    state: string,
    codeVerifier: string,
    nonce: string,
    scopes: string[],
  ): Promise<URL> {
    const url = await this.client.createAuthorizationURLWithPKCE(
      "https://accounts.google.com/o/oauth2/v2/auth",
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      scopes,
    );
    url.searchParams.set("nonce", nonce);
    return url;
  }

  public async validateAuthorizationCode(
    code: string,
    codeVerifier: string,
  ): Promise<OAuth2Tokens> {
    return this.client.validateAuthorizationCode(
      GOOGLE_TOKEN_ENDPOINT,
      code,
      codeVerifier,
    );
  }
}
