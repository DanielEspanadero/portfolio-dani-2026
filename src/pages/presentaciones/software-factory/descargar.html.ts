import type { APIRoute } from 'astro';
import { presentationDocument } from '../../../presentations/software-factory/document';

export const prerender = true;

export const GET: APIRoute = () => new Response(presentationDocument(true), {
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Disposition': 'attachment; filename="software-factory.html"',
    'X-Robots-Tag': 'noindex',
  },
});
