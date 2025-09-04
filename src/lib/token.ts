import { decodeBase64urlIgnorePadding } from "./encoding";
import { ObjectParser } from "./parser";

interface JwkWithKid extends JsonWebKey {
  kid?: string;
}

interface Jwks {
  keys: JwkWithKid[];
}

interface JwksCache {
  jwks: Jwks;
  expiresAt: number;
}

let jwksCache: JwksCache | null = null;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

async function getGoogleJwks(): Promise<Jwks> {
  if (jwksCache && jwksCache.expiresAt > Date.now()) {
    return jwksCache.jwks;
  }

  try {
    const discoveryResponse = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration",
    );
    if (!discoveryResponse.ok) {
      throw new Error("Failed to fetch Google OIDC discovery document");
    }
    const discoveryDoc = await discoveryResponse.json();
    const jwksUri = discoveryDoc.jwks_uri;
    if (!jwksUri) {
      throw new Error("JWKS URI not found in OIDC discovery document");
    }

    const jwksResponse = await fetch(jwksUri);
    if (!jwksResponse.ok) {
      throw new Error("Failed to fetch Google JWKS");
    }
    const jwks = (await jwksResponse.json()) as Jwks;

    jwksCache = {
      jwks,
      expiresAt: Date.now() + JWKS_CACHE_TTL_MS,
    };

    return jwks;
  } catch (e) {
    console.error(`Error fetching or caching JWKS: ${e}`);
    throw new Error("Could not retrieve Google's public keys for validation.");
  }
}

async function getVerificationKey(
  kid: string | undefined,
): Promise<CryptoKey | null> {
  const jwks = await getGoogleJwks();
  if (!kid) return null;

  const jwk = jwks.keys.find((key) => key.kid === kid);
  if (!jwk) return null;

  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

export async function validateIdToken(
  token: string,
  clientId: string,
  nonce: string,
): Promise<object> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid ID Token format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  const header = JSON.parse(
    new TextDecoder().decode(decodeBase64urlIgnorePadding(headerB64)),
  );
  const payload = JSON.parse(
    new TextDecoder().decode(decodeBase64urlIgnorePadding(payloadB64)),
  );
  const signature = decodeBase64urlIgnorePadding(signatureB64);

  const key = await getVerificationKey(header.kid);
  if (!key) {
    throw new Error("Could not find matching public key to verify token");
  }

  const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const isSignatureValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    new Uint8Array(signature),
    dataToVerify,
  );

  if (!isSignatureValid) {
    throw new Error("Invalid ID Token signature");
  }

  const claims = new ObjectParser(payload);
  const issuer = claims.getString("iss");
  if (
    issuer !== "https://accounts.google.com" &&
    issuer !== "accounts.google.com"
  ) {
    throw new Error(`Invalid issuer: ${issuer}`);
  }

  const audience = claims.getString("aud");
  if (audience !== clientId) {
    throw new Error(`Invalid audience: ${audience}`);
  }

  const expires = claims.getNumber("exp");
  if (expires * 1000 < Date.now()) {
    throw new Error("ID Token has expired");
  }

  const tokenNonce = claims.getString("nonce");
  if (tokenNonce !== nonce) {
    throw new Error("Invalid nonce");
  }

  return payload;
}
