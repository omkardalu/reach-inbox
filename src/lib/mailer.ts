import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured — set SMTP_HOST, SMTP_USER and SMTP_PASSWORD."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587/25 (STARTTLS)
    auth: { user, pass },
  });

  return cachedTransporter;
}

export type SendMailInput = {
  /** Comma-separated list of recipient addresses. */
  to: string;
  subject: string;
  text: string;
  /** Display name shown before the authenticated SMTP address, e.g. "Oliver Brown". */
  fromName?: string;
  /** Where replies should go — typically the logged-in user's real address. */
  replyTo?: string;
};

/**
 * Sends a plain-text email through the configured SMTP account.
 * Throws if SMTP isn't configured or the send fails — callers decide
 * what that means for the request (e.g. don't persist a "Sent" row).
 */
export async function sendMail({ to, subject, text, fromName, replyTo }: SendMailInput) {
  const transporter = getTransporter();
  const account = process.env.SMTP_USER!;

  await transporter.sendMail({
    from: fromName ? `"${fromName}" <${account}>` : account,
    to,
    subject: subject || "(no subject)",
    text,
    replyTo,
  });
}
