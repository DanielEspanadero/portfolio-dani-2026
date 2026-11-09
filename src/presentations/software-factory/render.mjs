/** Local compositions: content is always text; only this module owns markup. */
import { slides, chapters } from '../../content/software-factory/index.mjs';
import { renderPresentation as shell } from '../shared/render.mjs';

const route = '/presentaciones/software-factory';
const origin = 'https://daniel-espanadero.com';
export const escapeText = value => String(value).replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const e = escapeText;
const kit = ['README.md', 'AGENTS.md', 'specs/cancel-booking.md', 'factory/worker.md',
  'factory/reviewer.md', 'factory/handoff.md', 'src/cancellation.mjs', 'tests/cancellation.test.mjs'];
const chapterOf = slide => chapters.find(chapter => chapter.slides.includes(slide));
const stepped = slide => slide.steps || ['flow', 'loop', 'gate', 'parallel'].includes(slide.kind);

function item(slide, entry, index, tag = 'article') {
  // The station frame and its label are always visible: a slide must never open with
  // an empty diagram area. Only the explanation is revealed step by step.
  return `<${tag} class="panel station">
    <span class="station-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <h3>${e(entry.label)}</h3><p ${stepped(slide) ? 'data-step' : ''}>${e(entry.detail)}</p></${tag}>`;
}

/** SVG connectors stay behind the stations. Packets stop at a bounded checkpoint. */
function connectors(slide) {
  const loop = slide.kind === 'loop';
  const id = e(slide.id);
  const count = slide.items.length;
  const cell = (1680 + 42) / count;
  const links = Array.from({ length: count - 1 }, (_, i) => `<path class="route-line" d="M${(i + 1) * cell - 42} 230H${(i + 1) * cell - 3}" marker-end="url(#arrow-${id})"/>`).join('');
  return `<svg class="connectors" viewBox="0 0 1680 480" aria-hidden="true">
    <defs><marker id="arrow-${id}" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 2L10 6L2 10" fill="none" stroke="currentColor" stroke-width="2"/></marker></defs>
    ${slide.kind === 'parallel' ? `<path class="route-line" d="M1200 80H1245V240H1283M1200 240H1283M1200 410H1245V240" marker-end="url(#arrow-${id})"/>` : slide.kind === 'gate' ? `<path class="route-line" d="M10 230H650" marker-end="url(#arrow-${id})"/>` : links}
    ${loop ? `<path class="return-line" d="M1550 345V462H80V345" marker-end="url(#arrow-${id})"/>` : ''}
    <path class="packet" d="${slide.kind === 'parallel' ? 'M1200 80H1245V240H1283' : `M10 230H${slide.kind === 'gate' ? 650 : 1500}`}"/>
    </svg>`;
}

function composition(slide) {
  const items = slide.items.map((entry, index) => item(slide, entry, index)).join('');
  switch (slide.kind) {
    case 'hero':
      return `<svg class="hero-route" viewBox="0 0 1680 40" aria-label="Línea de producción de tres estaciones" role="img"><path d="M0 20H1660M530 10L550 20L530 30M1090 10L1110 20L1090 30" fill="none" stroke="#94c9d2" stroke-width="3"/></svg><div class="hero-line main-panels">${items}</div>`;
    case 'timeline':
      return `<div class="timeline main-panels" style="--count:${slide.items.length}">${items}</div>`;
    case 'comparison':
      return `<div class="comparison main-panels" style="--count:${slide.items.length}">${items}</div>`;
    case 'flow': case 'loop':
      return `<div class="diagram ${slide.kind}">${connectors(slide)}<div class="stations main-panels" style="--count:${slide.items.length}">${items}</div></div>`;
    case 'gate':
      return `<div class="gate-banner">⊣ DECISIÓN HUMANA · aceptar / corregir / detener</div>
        <div class="gate main-panels" style="--count:${slide.items.length}">${items}</div><div class="diagram-mini">${connectors(slide)}</div>`;
    case 'risk':
      return `<div class="risk main-panels">${items}</div>`;
    case 'code':
      return `<div class="code-layout main-panels"><pre class="panel code-panel"><code>${e(slide.code || '')}</code></pre>
        <div class="callouts">${items}</div></div>`;
    case 'table':
      return `<table class="boundary-table"><caption class="sr-only">${e(slide.title)}</caption><thead><tr><th scope="col">Entrada / criterio</th><th scope="col">Resultado / significado</th></tr></thead>
        <tbody>${slide.items.map(entry => `<tr class="panel"><th scope="row">${e(entry.label)}</th><td>${e(entry.detail)}</td></tr>`).join('')}</tbody></table>`;
    case 'parallel':
      return `<div class="parallel main-panels"><div class="lanes">${items}</div><aside class="integration panel"><h3>Integración compartida</h3><p>Contrato + pruebas del conjunto.</p><strong>Cierra el lote antes de operar</strong></aside></div>`;
    case 'exercise':
      return `<div class="workshop"><aside class="workshop-sign"><span>${slide.pause ? 'CHAT' : 'TALLER'}</span><p>Piensa → contrasta → explica</p></aside><div class="exercise main-panels">${items}</div></div>`;
    case 'closing':
      return `<div class="closing main-panels">${items}</div>`;
    default:
      return `<div class="checklist main-panels">${items}</div>`;
  }
}

function renderSlide(slide, index) {
  const chapter = chapterOf(slide);
  const heading = index === 0 ? 'h1' : 'h2';
  return `<section class="slide kind-${e(slide.kind)}" data-slide="${index + 1}" data-kind="${e(slide.kind)}" id="${e(slide.id)}" data-title="${e(slide.title)}" data-chapter="${e(chapter.title)}" aria-labelledby="title-${e(slide.id)}">
    <div class="registration" aria-hidden="true"></div>
    <header class="slide-heading"><p class="eyebrow">AI SOFTWARE FACTORY / ${e(chapter.title)}</p>
    <${heading} id="title-${e(slide.id)}">${e(slide.title)}</${heading}><p class="lead">${e(slide.lead)}</p></header>
    <div class="composition">${composition(slide)}</div>
    <footer class="slide-footer"><span>Daniel Españadero</span><span>${String(index + 1).padStart(2, '0')} / 54</span></footer>
  </section>`;
}

function sources(slide) {
  return (slide.sources || []).map(source => {
    // Only absolute web citations are links; all other strings remain inert text.
    const safe = /^https?:\/\//.test(source);
    return `<li>${safe ? `<a href="${e(source)}" rel="noreferrer">${e(source)}</a>` : e(source)}</li>`;
  }).join('');
}

export function renderPresentation({ css, controller, offline = false }) {
  const html = shell({
    slides: slides.map(renderSlide).join('\n'), css, controller, offline,
    canonical: `${origin}${route}`, title: 'AI Software Factory: qué es y cómo construir una | Daniel Españadero',
    description: '54 diapositivas: historia, estaciones de trabajo, agentes, riesgos, desarrollo paralelo y taller local para crear tu propia fábrica de software con IA.',
    chapterDefault: chapters[0].title,
  });
  return html;
}

/** The reading view deliberately has its own responsive, printable document. */
export function renderGuide({ css = '' } = {}) {
  const title = 'Guía de AI Software Factory y kit práctico | Daniel Españadero';
  const description = 'Notas completas de las 54 diapositivas sobre fábricas de software con IA, fuentes y kit local sin proveedor para practicar contratos y pruebas.';
  const canonical = `${origin}${route}/guia`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="article">
    <meta property="og:image" content="${origin}/og/default-og-image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin}/og/default-og-image.png">
    <style>${css}</style></head><body class="guide"><main><a href="${route}">← Abrir presentación</a>
    <h1>AI Software Factory: guía para enseñar y practicar</h1><p>Notas completas de las 54 diapositivas, fuentes y un kit local para repetir el ejemplo. El ejercicio es didáctico: no es una aplicación de reservas lista para producción.</p>
    <section aria-labelledby="kit-title"><h2 id="kit-title">Kit local, sin proveedor</h2><p>Node ≥22, sin instalar dependencias ni usar credenciales. Descarga el ZIP y extrae la carpeta; lee README.md. Desde su raíz: <code>node --test tests/cancellation.test.mjs</code>.</p>
    <p><a download href="/resources/software-factory-kit.zip">Descargar kit completo ZIP</a> · <a download href="${route}/descargar.html">Presentación HTML sin conexión</a></p>
    <p>El HTML incluye fuentes, estilos, diagramas y notas. La guía, los enlaces a fuentes y las descargas del kit requieren conexión. Alternativa: guarda estos ocho archivos conservando las carpetas:</p>
    <ul>${kit.map(file => `<li><a download href="/resources/software-factory/${file}">${file}</a></li>`).join('')}</ul>
    <p>Los eventos de devolución son simulados. No hay pagos, autenticación, persistencia ni concurrencia: integrar y publicar siguen siendo pasos separados con sus propias comprobaciones.</p></section>
    <nav aria-label="Capítulos"><h2>Recorrido</h2><ol>${chapters.map(ch => `<li><a href="#${ch.id}">${e(ch.title)}</a></li>`).join('')}</ol></nav>
    ${chapters.map(ch => `<section id="${ch.id}"><h2 class="chapter-title">${e(ch.title)}</h2>${ch.slides.map(slide => {
      const index = slides.indexOf(slide);
      return `<article id="${e(slide.id)}"><h3><a href="${route}#${index + 1}">${index + 1}. ${e(slide.title)}</a></h3><p class="guide-lead">${e(slide.lead)}</p><ul>${slide.items.map(entry => `<li><strong>${e(entry.label)}:</strong> ${e(entry.detail)}</li>`).join('')}</ul>
      ${slide.code ? `<pre><code>${e(slide.code)}</code></pre>` : ''}<p>${e(slide.notes)}</p>${slide.sources?.length ? `<h4>Fuentes</h4><ul>${sources(slide)}</ul>` : ''}</article>`;
    }).join('')}</section>`).join('')}</main></body></html>`;
}
