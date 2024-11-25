import { db } from "./db";
import { generateRandomOTP } from "./otp";
import {
	EmailVerificationRequest,
	emailVerificationRequests,
} from "./db/schema";
import { eq } from "drizzle-orm";

export const createEmailVerificationRequest = async (
	userId: number,
	email: string,
): Promise<EmailVerificationRequest> => {
	deleteUserEmailVerificationRequest(userId);

	const code: string = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
	const rea = await db
		.insert(emailVerificationRequests)
		.values({
			userId,
			email,
			code,
			expiresAt: new Date(expiresAt),
		})
		.returning({ id: emailVerificationRequests.id });

	const request: EmailVerificationRequest = {
		id: rea[0].id,
		userId,
		code,
		email,
		expiresAt,
	};
	return request;
};

export const deleteUserEmailVerificationRequest = async (
	userId: number,
): Promise<void> => {
	await db
		.delete(emailVerificationRequests)
		.where(eq(emailVerificationRequests.userId, userId));
};

export const sendVerificationEmail = async (
	email: string,
	code: string,
): Promise<void> => {
	console.log(`To ${email}: Your verification code is ${code}`);
};
