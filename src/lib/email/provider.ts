import { Resend } from "resend";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export class EmailSendError extends Error {
  userMessage: string;
  statusCode: number;

  constructor(message: string, userMessage: string, statusCode = 502) {
    super(message);
    this.name = "EmailSendError";
    this.userMessage = userMessage;
    this.statusCode = statusCode;
  }
}

export type EmailProvider = "resend" | "emailjs";

const RESEND_SANDBOX_HINT =
  "Resend test mode only delivers to your own inbox. Verify a domain in Resend and set RESEND_FROM to noreply@yourdomain.com (no mailbox needed — DNS only).";

const EMAILJS_SETUP_HINT =
  "Check EmailJS: connect a mail service (e.g. a dedicated Gmail), create a template with to_email, subject, and {{{story_html}}}, and set all EMAILJS_* env vars in Vercel.";

function emailJsConfigured(): boolean {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID?.trim() &&
      process.env.EMAILJS_TEMPLATE_ID?.trim() &&
      process.env.EMAILJS_PUBLIC_KEY?.trim(),
  );
}

function resolveProvider(): EmailProvider | null {
  const forced = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (forced === "emailjs") return emailJsConfigured() ? "emailjs" : null;
  if (forced === "resend") return process.env.RESEND_API_KEY ? "resend" : null;

  if (emailJsConfigured()) return "emailjs";
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return null;
}

export function getActiveEmailProvider(): EmailProvider | null {
  return resolveProvider();
}

export function hasEmailProviderConfigured(): boolean {
  return resolveProvider() !== null;
}

function mapResendError(error: { name?: string; message?: string }): never {
  const msg = error.message ?? "Unknown Resend error";
  if (
    msg.includes("only send testing emails to your own email") ||
    msg.includes("verify a domain")
  ) {
    throw new EmailSendError(`Resend: ${msg}`, RESEND_SANDBOX_HINT, 503);
  }
  if (msg.includes("not verified") || msg.includes("domain")) {
    throw new EmailSendError(
      `Resend: ${msg}`,
      "The sender domain is not verified in Resend. Check RESEND_FROM matches a verified domain.",
      503,
    );
  }
  throw new EmailSendError(`Resend: ${error.name ?? "Error"}: ${msg}`, msg);
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new EmailSendError(
      "RESEND_API_KEY missing",
      "Email is not configured.",
      503,
    );
  }

  const from =
    process.env.RESEND_FROM?.trim() ?? "Dev Story <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (error) mapResendError(error);
}

async function sendViaEmailJS(payload: EmailPayload): Promise<void> {
  if (!emailJsConfigured()) {
    throw new EmailSendError(
      "EmailJS env incomplete",
      "Email is not configured.",
      503,
    );
  }

  const body: Record<string, unknown> = {
    service_id: process.env.EMAILJS_SERVICE_ID!.trim(),
    template_id: process.env.EMAILJS_TEMPLATE_ID!.trim(),
    user_id: process.env.EMAILJS_PUBLIC_KEY!.trim(),
    template_params: {
      to_email: payload.to,
      subject: payload.subject,
      story_html: payload.html,
      story_text: payload.text,
    },
  };

  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  if (privateKey) {
    body.accessToken = privateKey;
  }

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) return;

  const detail = (await res.text()).slice(0, 400);
  throw new EmailSendError(
    `EmailJS ${res.status}: ${detail}`,
    res.status === 403 || res.status === 401
      ? EMAILJS_SETUP_HINT
      : "Email could not be sent. Try again.",
    res.status === 403 || res.status === 401 ? 503 : 502,
  );
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<void> {
  const provider = resolveProvider();
  if (!provider) {
    throw new EmailSendError(
      "No email provider configured",
      "Email is not configured.",
      503,
    );
  }

  if (provider === "emailjs") {
    await sendViaEmailJS(payload);
    return;
  }

  await sendViaResend(payload);
}
