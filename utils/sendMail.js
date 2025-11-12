// utils/sendMail.js
import nodemailer from "nodemailer";

// Reuse a single transporter instance
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send an HTML email
 * @param {string|string[]} to - recipient email(s)
 * @param {string} subject - subject line
 * @param {string} html - html body
 * @param {string} [fromName="BTPL"] - display name for the sender
 */
export const sendMail = async (to, subject, html, fromName = "BTPL") => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error("Mail error: MAIL_USER or MAIL_PASS is not set in environment variables");
    return;
  }
  if (!to || !subject || !html) {
    console.error("Mail error: 'to', 'subject', and 'html' are required");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Mail error:", err?.message || err);
  }
};

export default sendMail;
