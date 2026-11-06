import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const decode = value => value.replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&amp;', '&');

test('displayed Java 25 examples compile and produce their declared results', () => {
  const html = readFileSync(new URL('../src/content/patrones-diseno/slides.html', import.meta.url), 'utf8');
  const snippets = [...html.matchAll(/<code data-java="([^"]+)" data-output="([^"]*)">([\s\S]*?)<\/code>/g)];
  assert.equal(snippets.length, 29);
  const version = spawnSync('javac', ['-version'], { encoding: 'utf8' });
  assert.equal(version.status, 0, version.stderr);
  // Los ejemplos se presentan como Java 25. Se compilan con la mayor release que
  // el JDK instalado permita, hasta 25: si el entorno sólo tiene 21, la corrida
  // prueba compatibilidad hacia atrás en vez de fingir un JDK que no existe.
  const installed = Number((version.stdout.match(/(\d+)/) || [])[1]);
  const release = String(Math.min(installed, 25));
  const edgeChecks = {
    prototype: `
      var colors = new ArrayList<>(List.of("blue"));
      var badge = new Badge("A", colors);
      colors.add("red");
      if (badge.colors().size() != 1) throw new AssertionError("aliased input");
      try { badge.colors().add("red"); throw new AssertionError("mutable copy"); }
      catch (UnsupportedOperationException expected) { }
    `,
    memento: `
      var editor = new Editor(); editor.add("first");
      var saved = editor.save(); editor.add("second");
      try { saved.lines().add("bad"); throw new AssertionError("mutable snapshot"); }
      catch (UnsupportedOperationException expected) { }
      editor.restore(saved); editor.add("third"); editor.restore(saved);
      if (!editor.text().equals("first")) throw new AssertionError("aliased restore");
    `,
    proxy: `
      if (!new Guarded(new Report(), true).read().equals("informe"))
        throw new AssertionError("authorized delegation");
    `,
    'chain-of-responsibility': `
      Handler chain = new EmptyCheck(new LengthCheck(text -> "ok"));
      if (!chain.handle("longer than ten").equals("demasiado largo"))
        throw new AssertionError("length guard");
    `,
    'service-layer': `
      var names = new ArrayList<String>();
      var service = new BookingService(names::add);
      try { service.book(" "); throw new AssertionError("missing validation"); }
      catch (IllegalArgumentException expected) { }
      if (!names.isEmpty()) throw new AssertionError("saved invalid reservation");
    `,
    'circuit-breaker-retry': `
      var circuit = new Circuit(); int[] attempts = {0};
      String value = circuit.read(() -> {
        if (++attempts[0] < 2) throw new IllegalStateException();
        return "ok";
      });
      if (!value.equals("ok") || attempts[0] != 2)
        throw new AssertionError("retry recovery");
      if (!circuit.read(() -> "still closed").equals("still closed"))
        throw new AssertionError("opened after recovered operation");
    `,
  };
  const dir = mkdtempSync(join(tmpdir(), 'patrones-java-'));
  try {
    for (const [, id, expected, encoded] of snippets) {
      const source = decode(encoded);
      assert.ok(source.split('\n').length <= 22, `${id}: projector line budget`);
      const checks = edgeChecks[id] ? `static { ${edgeChecks[id]} }` : '';
      writeFileSync(join(dir, 'Demo.java'), `import java.util.*;\nimport java.util.function.*;\nclass Demo {\n${source}\n${checks}\n}`);
      const compiled = spawnSync('javac', ['--release', release, '-d', dir, join(dir, 'Demo.java')], { encoding: 'utf8' });
      assert.equal(compiled.status, 0, `${id}: ${compiled.stderr}`);
      const run = spawnSync('java', ['-cp', dir, 'Demo'], { encoding: 'utf8' });
      assert.equal(run.status, 0, `${id}: ${run.stderr}`);
      assert.equal(run.stdout.trim(), decode(expected), id);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
