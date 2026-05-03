import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRegex = /^[A-Za-zÀ-ÿÑñ0-9][A-Za-zÀ-ÿÑñ0-9 .'-]{1,78}[A-Za-zÀ-ÿÑñ0-9]$/;
const maxBodySize = 16_384;
const maxTurnstileTokenLength = 2048;
const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

export const POST: APIRoute = async ({ request }) => {
  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (Number.isFinite(contentLength) && contentLength > maxBodySize) {
    return redirectWithStatus('/?contact=invalid#contacto');
  }

  const formData = await request.formData();

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const message = String(formData.get('message') ?? '').trim();
  const honeypot = String(formData.get('company') ?? '').trim();
  const turnstileToken = String(formData.get('cf-turnstile-response') ?? '').trim();

  if (honeypot) {
    return redirectWithStatus('/?contact=ok#contacto');
  }

  const fieldErrors = validateContactFields({ name, email, message });

  if (fieldErrors.length > 0) {
    console.warn('Invalid contact form submission', fieldErrors);
    return redirectWithStatus('/?contact=invalid#contacto');
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO_EMAIL;
  const from = import.meta.env.CONTACT_FROM_EMAIL;
  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  const expectedHostname = import.meta.env.TURNSTILE_EXPECTED_HOSTNAME;

  if (!apiKey || !to || !from || !turnstileSecret) {
    console.error('Missing contact environment variables');
    return redirectWithStatus('/?contact=error#contacto');
  }

  const remoteIp = getClientIp(request);
  const turnstile = await verifyTurnstile(turnstileToken, turnstileSecret, remoteIp, expectedHostname);

  if (!turnstile.success) {
    console.warn('Turnstile validation failed', turnstile['error-codes']);
    return redirectWithStatus('/?contact=invalid#contacto');
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Nuevo contacto desde daniel-espanadero.com: ${sanitizeSubject(name)}`,
    html: `
      <h1>Nuevo mensaje desde el portfolio</h1>
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    `,
  });

  if (error) {
    console.error('Resend error', error);
    return redirectWithStatus('/?contact=error#contacto');
  }

  return redirectWithStatus('/?contact=ok#contacto');
};

function redirectWithStatus(location: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validateContactFields({ name, email, message }: { name: string; email: string; message: string }) {
  const errors: string[] = [];

  if (name.length < 3 || name.length > 80) {
    errors.push('invalid-name-length');
  }

  if (!nameRegex.test(name) || /https?:\/\//i.test(name) || /@/.test(name) || hasUnsafeContent(name)) {
    errors.push('invalid-name-format');
  }

  if (!isValidEmail(email) || hasUnsafeContent(email)) {
    errors.push('invalid-email');
  }

  if (message.length < 20 || message.length > 3000) {
    errors.push('invalid-message-length');
  }

  if (message.split(/\s+/).filter(Boolean).length < 4 || new Set(message.replace(/\s/g, '')).size < 5) {
    errors.push('invalid-message-content');
  }

  if (hasUnsafeContent(message)) {
    errors.push('unsafe-message-content');
  }

  if (hasPromptInjectionContent(message)) {
    errors.push('prompt-injection-content');
  }

  return errors;
}

function isValidEmail(email: string) {
  if (!email || email.length > 254 || !emailRegex.test(email) || email.includes('..')) {
    return false;
  }

  const [localPart, domain] = email.split('@');

  if (!localPart || !domain || localPart.length > 64) {
    return false;
  }

  if (domain.startsWith('.') || domain.endsWith('.') || !domain.includes('.')) {
    return false;
  }

  const domainParts = domain.split('.');

  return domainParts.every((part) => part.length > 0 && part.length <= 63 && /^[a-z0-9-]+$/i.test(part) && !part.startsWith('-') && !part.endsWith('-'));
}

function hasUnsafeContent(value: string) {
  const unsafePatterns = [
    /<\/?[a-z][\s\S]*>/i,
    /\b(?:javascript|data|vbscript)\s*:/i,
    /\bon[a-z]+\s*=/i,
    /<\s*script\b/i,
    /<\s*iframe\b/i,
    /<\s*object\b/i,
    /<\s*embed\b/i,
    /\b(?:document|window|localStorage|sessionStorage)\s*\./i,
    /\b(?:eval|Function|setTimeout|setInterval)\s*\(/i,
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/,
  ];

  return unsafePatterns.some((pattern) => pattern.test(value));
}

function hasPromptInjectionContent(value: string) {
  const promptInjectionPatterns = [
    /\b(?:ignore|ignora|olvida|descarta)\b.{0,90}\b(?:previous|anteriores|instrucciones|instructions|system|sistema|developer)\b/i,
    /\b(?:actúa|actua|pretend|roleplay|eres ahora|you are now)\b.{0,90}\b(?:system|assistant|developer|admin|root|sistema)\b/i,
    /\b(?:prompt injection|system prompt|developer message|mensaje del sistema|instrucciones del sistema)\b/i,
    /\b(?:reveal|muestra|dime|print|imprime|filtra)\b.{0,90}\b(?:prompt|secret|api key|clave|token|credencial|contraseña)\b/i,
  ];

  return promptInjectionPatterns.some((pattern) => pattern.test(value));
}

function sanitizeSubject(value: string) {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 120);
}

function getClientIp(request: Request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    undefined
  );
}

async function verifyTurnstile(token: string, secret: string, remoteIp?: string, expectedHostname?: string): Promise<TurnstileResponse> {
  if (!token || token.length > maxTurnstileTokenLength) {
    return { success: false, 'error-codes': ['missing-or-invalid-token'] };
  }

  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    body.append('idempotency_key', crypto.randomUUID());

    if (remoteIp) {
      body.append('remoteip', remoteIp);
    }

    const response = await fetch(turnstileVerifyUrl, {
      method: 'POST',
      body,
    });

    const result = (await response.json()) as TurnstileResponse;

    if (!response.ok || !result.success) {
      return { ...result, success: false };
    }

    if (result.action && result.action !== 'contact') {
      return { success: false, 'error-codes': ['action-mismatch'] };
    }

    if (expectedHostname && result.hostname !== expectedHostname) {
      return { success: false, 'error-codes': ['hostname-mismatch'] };
    }

    return result;
  } catch (error) {
    console.error('Turnstile validation error', error);
    return { success: false, 'error-codes': ['turnstile-request-failed'] };
  }
}
