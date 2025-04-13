import { headers } from "next/headers";
import { RefillingTokenBucket } from "./rate-limit";

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = (await headers()).get("X-Forwarded-For");
  if (clientIP === null) return true;

  return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = (await headers()).get("X-Forwarded-For");
  if (clientIP === null) return true;

  return globalBucket.consume(clientIP, 3);
}
