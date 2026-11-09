/**
 * This deck ships as one inline `<script type="module">`, so its local modules travel as
 * source text instead of being resolved by a bundler: a literal `import` statement would
 * fail at run time, and every local module therefore has to share one module scope.
 *
 * The production document and the browser checker inline the same files through this
 * function, so the composition the checker proves is the composition that ships.
 */
export function inlineModules(...sources) {
  return sources.join('\n')
    .replace(/^import\b[^;]*;?[ \t]*\n?/gm, '')
    .replace(/^export\s+(?=(?:const|let|var|function|class))/gm, '');
}
