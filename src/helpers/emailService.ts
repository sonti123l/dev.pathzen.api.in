import nodemailer from "nodemailer";
import "dotenv/config";

export const sendOTP = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // generated ethereal user or your email
        pass: process.env.SMTP_PASS, // generated ethereal password or app password
      },
    });

    const info = await transporter.sendMail({
      from: `"Pathzen Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Pathzen - Password Reset Verification Code",
      text: `Hello,\n\nYour One-Time Password (OTP) for resetting your Pathzen account password is: ${otp}\n\nThis OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email.\n\nBest regards,\nThe Pathzen Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333333; text-align: center;">Pathzen Password Reset</h2>
          <p style="color: #555555; font-size: 16px;">Hello,</p>
          <p style="color: #555555; font-size: 16px;">You recently requested to reset your password for your Pathzen account. Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <strong style="font-size: 24px; color: #000000; letter-spacing: 2px;">${otp}</strong>
          </div>
          <p style="color: #555555; font-size: 14px;">This OTP is valid for the next <strong>10 minutes</strong>. For security reasons, do not share this code with anyone.</p>
          <p style="color: #777777; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending OTP email: ", error);
    return false;
  }
};
