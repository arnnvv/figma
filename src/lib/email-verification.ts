import { db } from "./db";
import { generateRandomOTP } from "./otp";
import {
  type EmailVerificationRequest,
  emailVerificationRequests,
} from "./db/schema";
import { eq } from "drizzle-orm";
import { createTransport } from "nodemailer";

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
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendEmail = async ({
  userId,
  email,
}: {
  userId: number;
  email: string;
}): Promise<void> => {
  const emailVerificationRequest = await createEmailVerificationRequest(
    userId,
    email,
  );

  sendVerificationEmail(
    emailVerificationRequest.email,
    emailVerificationRequest.code,
  );
};
