import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Send email
    const info = await transporter.sendMail({
      from: `"SmartPurse POS" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    return { success: false, error: err.message };
  }
};
