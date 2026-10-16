import type { APIRoute } from 'astro';
import { presentationDocument } from '../../../presentations/sdd/document';

export const prerender = true;

export const GET: APIRoute = () => new Response(presentationDocument(true), {
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Disposition': 'attachment; filename="sdd-con-ia.html"',
    'X-Robots-Tag': 'noindex',
  },
});
