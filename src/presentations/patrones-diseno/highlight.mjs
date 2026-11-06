/**
 * Resaltado de sintaxis para los ejemplos Java del deck.
 *
 * Se aplica en tiempo de render, no en el contenido: `slides.html` guarda el
 * código plano y el test que lo compila (`tests/patrones-java.test.mjs`) sigue
 * extrayéndolo con una regex sin etiquetas dentro. Este módulo sólo envuelve
 * tokens en `<span>`; nunca agrega, quita ni reordena caracteres visibles.
 */

const KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import',
  'instanceof', 'int', 'interface', 'long', 'new', 'package', 'private',
  'protected', 'public', 'record', 'return', 'sealed', 'short', 'static',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'var', 'void', 'volatile', 'while', 'yield', 'permits', 'non-sealed',
]);

const LITERALS = new Set(['true', 'false', 'null']);

// Comentario, cadena, entidad HTML, anotación, identificador, número.
// El orden importa: la entidad va antes que el identificador para no teñir el
// `lt` de `&lt;`, y el comentario antes que todo para no teñir su contenido.
const TOKEN = /(\/\/[^\n]*)|(&quot;[^\n]*?&quot;)|(&(?:[a-z]+|#\d+);)|(@[A-Za-z]+)|\b([A-Za-z_][A-Za-z0-9_]*)\b|(\d+)/g;

function classify(match, comment, string, entity, annotation, word, number) {
  if (comment) return `<span class="c">${comment}</span>`;
  if (string) return `<span class="s">${string}</span>`;
  if (entity) return entity;
  if (annotation) return `<span class="a">${annotation}</span>`;
  if (number) return `<span class="n">${number}</span>`;
  if (word) {
    if (KEYWORDS.has(word)) return `<span class="k">${word}</span>`;
    if (LITERALS.has(word)) return `<span class="l">${word}</span>`;
    if (/^[A-Z]/.test(word)) return `<span class="t">${word}</span>`;
    return word;
  }
  return match;
}

export function highlightJavaBlock(block) {
  return block.replace(TOKEN, (...args) => classify(...args));
}

/** Envuelve el contenido de cada `<code data-java=...>` del documento. */
export function highlightJava(html) {
  return html.replace(
    /(<code data-java="[^"]+"[^>]*>)([\s\S]*?)(<\/code>)/g,
    (match, open, body, close) => open + highlightJavaBlock(body) + close,
  );
}
