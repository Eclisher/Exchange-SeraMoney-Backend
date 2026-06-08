import dotenv from "dotenv";

dotenv.config();

const { transporter, isMailConfigured } = await import("../src/config/mail.js");

console.log("isMailConfigured=", isMailConfigured);
if (!isMailConfigured) {
  console.error("Mail not configured (MAIL_USER or MAIL_PASS missing).");
  process.exit(1);
}

try {
  const info = await transporter.sendMail({
    from: `"Test" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: "Test SMTP from seramoney backend",
    text: "This is a test email from seramoney backend.",
  });
  console.log("Mail sent:", info);
} catch (err) {
  console.error("SMTP ERROR:", err);
  process.exit(1);
}
