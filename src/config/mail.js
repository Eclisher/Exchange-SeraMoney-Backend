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

// Optional: force IPv4 for DNS lookups to avoid ENETUNREACH on hosts
// that return AAAA records while the environment lacks IPv6 connectivity.
// Enable by setting MAIL_FORCE_IPV4=true in the environment.
if (process.env.MAIL_FORCE_IPV4 === "true") {
  const originalLookup = dns.lookup.bind(dns);
  dns.lookup = (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    // If caller explicitly requested IPv6, respect that.
    if (options && options.family === 6) {
      return originalLookup(hostname, options, callback);
    }
    const newOptions = Object.assign({}, options || {}, { family: 4 });
    return originalLookup(hostname, newOptions, callback);
  };
}

const transportOptions = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure:
    process.env.MAIL_SECURE === "true" || Number(process.env.MAIL_PORT) === 465,
  ...(isMailConfigured && {
    auth: { user: mailUser, pass: mailPass },
  }),
  // Enable debug/logging when MAIL_DEBUG=true
  logger: process.env.MAIL_DEBUG === "true",
  debug: process.env.MAIL_DEBUG === "true",
  // Timeouts (ms) — adjust via env if necessary
  connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT) || 10000,
  greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT) || 10000,
  // increase socket timeout slightly; can be overridden via env
  socketTimeout: Number(process.env.MAIL_SOCKET_TIMEOUT) || 30000,
  tls: {
    // Allow adjusting TLS verification if your environment intercepts certs
    rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED !== "false",
    // ensure servername (SNI) matches the mail host when connecting to an IP
    servername: process.env.MAIL_HOST || "smtp.gmail.com",
  },
};

export const transporter = nodemailer.createTransport(transportOptions);
