import { encodeBase32 } from "@oslojs/encoding";
import { db } from "./db";
import { generateRandomOTP } from "./otp";
import { EmailVerificationRequest, emailVerificationRequests } from "./db/schema";
import { eq } from "drizzle-orm";

export function createEmailVerificationRequest(userId: number, email: string): EmailVerificationRequest {
	deleteUserEmailVerificationRequest(userId);
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32(idBytes).toLowerCase();

	const code: string = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  db
  .insert(emailVerificationRequests)
  .values({
      id,
      userId,
      email,
      code,
      expiresAt: new Date(expiresAt),
  })

	const request: EmailVerificationRequest = {
		id,
		userId,
		code,
		email,
		expiresAt
	};
	return request;
}

export const deleteUserEmailVerificationRequest = (userId: number): void => {
  db.delete(emailVerificationRequests).where(eq(emailVerificationRequests.userId, userId));
}
