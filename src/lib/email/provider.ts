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

export type EmailProvider = "emailjs";

const EMAILJS_SETUP_HINT =
  "Check EmailJS Account → Security: enable “Allow EmailJS API for non-browser applications”, add your Vercel domain under Allowed domains, and confirm EMAILJS_PRIVATE_KEY is set in Vercel.";

function emailJsConfigured(): boolean {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID?.trim() &&
      process.env.EMAILJS_TEMPLATE_ID?.trim() &&
      process.env.EMAILJS_PUBLIC_KEY?.trim() &&
      process.env.EMAILJS_PRIVATE_KEY?.trim(),
  );
}

export function getActiveEmailProvider(): EmailProvider | null {
  return emailJsConfigured() ? "emailjs" : null;
}

export function hasEmailProviderConfigured(): boolean {
  return emailJsConfigured();
}

async function sendViaEmailJS(payload: EmailPayload): Promise<void> {
  if (!emailJsConfigured()) {
    throw new EmailSendError(
      "EmailJS env incomplete",
      "Email is not configured.",
      503,
    );
  }

  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new EmailSendError(
      "EMAILJS_PRIVATE_KEY missing",
      "Email is not configured.",
      503,
    );
  }

  const body: Record<string, unknown> = {
    service_id: process.env.EMAILJS_SERVICE_ID!.trim(),
    template_id: process.env.EMAILJS_TEMPLATE_ID!.trim(),
    user_id: process.env.EMAILJS_PUBLIC_KEY!.trim(),
    accessToken: privateKey,
    template_params: {
      to_email: payload.to,
      subject: payload.subject,
      story_html: payload.html,
      story_text: payload.text,
    },
  };

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) return;

  const detail = (await res.text()).slice(0, 400);
  const userMessage =
    res.status === 403 || res.status === 401
      ? detail.trim() || EMAILJS_SETUP_HINT
      : "Email could not be sent. Try again.";
  throw new EmailSendError(
    `EmailJS ${res.status}: ${detail}`,
    userMessage,
    res.status === 403 || res.status === 401 ? 503 : 502,
  );
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<void> {
  if (!emailJsConfigured()) {
    throw new EmailSendError(
      "EmailJS not configured",
      "Email is not configured.",
      503,
    );
  }

  await sendViaEmailJS(payload);
}
