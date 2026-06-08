import dotenv from "dotenv";

dotenv.config();

const { transporter, isMailConfigured } = await import("../src/config/mail.js");

console.log("isMailConfigured=", isMailConfigured);
if (!isMailConfigured) {
  console.error("Mail not configured (MAIL_USER or MAIL_PASS missing).");
  process.exit(1);
}
import dns from "dns/promises";

// Print DNS resolution for MAIL_HOST to help debug IPv4/IPv6 issues
const mailHost = process.env.MAIL_HOST || "smtp.gmail.com";
try {
  const a = await dns.resolve4(mailHost).catch(() => []);
  const aaaa = await dns.resolve6(mailHost).catch(() => []);
  console.log("DNS A records:", a);
  console.log("DNS AAAA records:", aaaa);
} catch (e) {
  console.warn("DNS resolution error:", e.message || e);
}

try {
  // Verify connection configuration before sending
  await transporter.verify();
  console.log("SMTP transporter verified: connection to server ok");

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
