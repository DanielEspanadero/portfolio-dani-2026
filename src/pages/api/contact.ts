import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  const honeypot = String(formData.get('company') ?? '').trim();

  if (honeypot) {
    return redirectWithStatus('/?contact=ok#contacto');
  }

  if (name.length < 3 || name.length > 120 || !emailRegex.test(email) || message.length < 10 || message.length > 4000) {
    return redirectWithStatus('/?contact=invalid#contacto');
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO_EMAIL;
  const from = import.meta.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error('Missing Resend contact environment variables');
    return redirectWithStatus('/?contact=error#contacto');
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Nuevo contacto desde daniel-espanadero.com: ${name}`,
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
