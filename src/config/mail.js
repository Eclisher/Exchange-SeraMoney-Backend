import nodemailer from "nodemailer";
import dns from "dns";

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

const parseBoolean = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase() === "true"
    : Boolean(value);

const forceIPv4 = parseBoolean(process.env.MAIL_FORCE_IPV4);
const mailDebug = parseBoolean(process.env.MAIL_DEBUG);

export const isMailConfigured = Boolean(mailUser && mailPass);

// Force IPv4 for DNS lookups only when explicitly requested.
// This avoids ENETUNREACH issues on hosts that return AAAA records
// while the environment has no outbound IPv6 connectivity.
if (forceIPv4) {
  const originalLookup = dns.lookup.bind(dns);
  dns.lookup = (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    const newOptions = Object.assign({}, options || {}, { family: 4 });
    return originalLookup(hostname, newOptions, callback);
  };
}

const transportOptions = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure:
    parseBoolean(process.env.MAIL_SECURE) ||
    Number(process.env.MAIL_PORT) === 465,
  ...(isMailConfigured && {
    auth: { user: mailUser, pass: mailPass },
  }),
  logger: mailDebug,
  debug: mailDebug,
  connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT) || 10000,
  greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT) || 10000,
  socketTimeout: Number(process.env.MAIL_SOCKET_TIMEOUT) || 30000,
  tls: {
    rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED !== "false",
    servername: process.env.MAIL_HOST || "smtp.gmail.com",
  },
};

export const transporter = nodemailer.createTransport(transportOptions);
