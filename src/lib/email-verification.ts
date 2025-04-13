import type { QueryResult } from "pg";
import { db } from "./db";
import { generateRandomOTP } from "./otp";
import type { EmailVerificationRequest } from "./db/types";
import { createTransport } from "nodemailer";

export async function createEmailVerificationRequest(
  userId: number,
  email: string,
): Promise<EmailVerificationRequest> {
  await deleteUserEmailVerificationRequest(userId);

  const code: string = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes expiry

  const insertSql = `
    INSERT INTO figma_email_verification_request (user_id, email, code, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const insertParams: [number, string, string, Date] = [
    userId,
    email,
    code,
    expiresAt,
  ];

  try {
    const result: QueryResult<{ id: number }> = await db.query(
      insertSql,
      insertParams,
    );

    if (result.rowCount! > 0 && result.rows[0]?.id) {
      const request: EmailVerificationRequest = {
        id: result.rows[0].id,
        user_id: userId, // Use userId passed to the function
        email: email, // Use email passed to the function
        code: code, // Use code generated
        expires_at: expiresAt, // Use expiresAt generated
      };
      return request;
    } else {
      throw new Error(
        "Email verification request insertion failed, no ID returned.",
      );
    }
  } catch (error) {
    console.error(
      `Error creating email verification request for user (${userId}):`,
      error,
    );
    throw error; // Re-throw the error
  }
}

export async function deleteUserEmailVerificationRequest(
  userId: number,
): Promise<void> {
  const deleteSql =
    "DELETE FROM figma_email_verification_request WHERE user_id = $1";
  const deleteParams = [userId];

  try {
    const result = await db.query(deleteSql, deleteParams);
    console.log(
      `Deleted ${result.rowCount!} email verification requests for user ID: ${userId}`,
    );
  } catch (error) {
    console.error(
      `Error deleting email verification requests for user (${userId}):`,
      error,
    );
    throw error;
  }
}

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
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
      // connectionTimeout: 5000, // 5 seconds
      // greetingTimeout: 5000, // 5 seconds
      // socketTimeout: 5000, // 5 seconds
    });

    // await transporter.verify();
    // console.log("Nodemailer transporter verified successfully.");
  } catch (configError) {
    console.error("Error configuring Nodemailer transporter:", configError);
    throw new Error("Failed to configure email service.");
  }

  const mailOptions = {
    from: process.env.EMAIL,
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
