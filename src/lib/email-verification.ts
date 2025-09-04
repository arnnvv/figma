import { createTransport } from "nodemailer";
import { appConfig } from "./config";
import {
  deleteEmailVerificationByUserId_Raw,
  insertEmailVerification_Raw,
} from "./db/inlinequeries";
import type { EmailVerificationRequest } from "./db/types";
import { generateRandomOTP } from "./otp";

export const createEmailVerificationRequest = async (
  userId: number,
  email: string,
): Promise<EmailVerificationRequest> => {
  await deleteEmailVerificationByUserId_Raw(userId);

  const code: string = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  const { id } = await insertEmailVerification_Raw({
    user_id: userId,
    email,
    code,
    expires_at: expiresAt,
  });

  return { id, user_id: userId, email, code, expires_at: expiresAt };
};

export const deleteUserEmailVerificationRequest = async (
  userId: number,
): Promise<void> => {
  await deleteEmailVerificationByUserId_Raw(userId);
};

export const sendVerificationEmail = async (
  email: string,
  code: string,
): Promise<void> => {
  if (!email || !code) {
    throw new Error("Email and code are required to send verification email.");
  }

  let transporter;
  try {
    transporter = createTransport({
      host: appConfig.email.smtpHost,
      port: appConfig.email.smtpPort,
      secure: true,
      auth: {
        user: appConfig.email.user,
        pass: appConfig.email.pass,
      },
    });
  } catch (configError) {
    console.error("Error configuring Nodemailer transporter:", configError);
    throw new Error("Failed to configure email service.");
  }

  const mailOptions = {
    from: appConfig.email.user,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Verification email sent successfully to ${email}. Message ID: ${info.messageId}`,
    );
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    throw new Error(
      "Failed to send verification email. Please try again later.",
    );
  }
};

export const sendEmail = async ({
  userId,
  email,
}: {
  userId: number;
  email: string;
}): Promise<void> => {
  try {
    const emailVerificationRequest = await createEmailVerificationRequest(
      userId,
      email,
    );

    await sendVerificationEmail(
      emailVerificationRequest.email,
      emailVerificationRequest.code,
    );
  } catch (error) {
    console.error(
      `Failed to send verification email process for user ${userId} (${email}):`,
      error,
    );
    throw new Error("Failed to initiate email verification.");
  }
};
