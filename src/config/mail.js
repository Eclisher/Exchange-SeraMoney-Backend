import nodemailer from "nodemailer";
import dns from "dns";

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

export const isMailConfigured = Boolean(mailUser && mailPass);

// Prefer IPv4 addresses when resolving DNS to avoid ENETUNREACH on hosts
// that return AAAA records while the environment lacks IPv6 connectivity.
// This is less intrusive than overriding `dns.lookup` globally.
if (typeof dns.setDefaultResultOrder === "function") {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch (err) {
    // ignore; keep default resolution order
  }
}

const transportOptions = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  ...(isMailConfigured && {
    auth: { user: mailUser, pass: mailPass },
  }),
};

export const transporter = nodemailer.createTransport(transportOptions);
