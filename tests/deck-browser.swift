// macOS-only functional browser probe using the system WebKit; no package install.
// Shared by every deck; the slide-count window is a per-deck argument.
// Usage: swift tests/deck-browser.swift <URL-or-file-path> <artifact-directory> [width] [height] [captureSlide] [minSlides] [maxSlides]
import AppKit
import WebKit

let arguments = CommandLine.arguments
if arguments.count < 3 {
    fputs("Usage: swift tests/deck-browser.swift <URL-or-file-path> <artifact-directory> [width] [height] [captureSlide] [minSlides] [maxSlides]\n", stderr)
    exit(2)
}
let input = arguments[1]
let destination = URL(fileURLWithPath: arguments[2], isDirectory: true)
let width = Double(arguments.count > 3 ? arguments[3] : "1440") ?? 1440
let height = Double(arguments.count > 4 ? arguments[4] : "900") ?? 900
let captureSlide = Int(arguments.count > 5 ? arguments[5] : "1") ?? 1
let minSlides = Int(arguments.count > 6 ? arguments[6] : "8") ?? 8
let maxSlides = Int(arguments.count > 7 ? arguments[7] : "15") ?? 15
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)

final class BrowserProbe: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    var view: WKWebView!
    var window: NSWindow!
    var finished = false
    var started = false

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "progress" { print("Browser: \(message.body)"); fflush(stdout); return }
        guard !finished else { return }
        finished = true
        let report = message.body as? [String: Any] ?? ["error": "Invalid browser report"]
        do {
            let data = try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys])
            try data.write(to: destination.appendingPathComponent("report.json"))
            print(String(data: data, encoding: .utf8)!)
        } catch {
            fputs("Cannot write browser report: \(error)\n", stderr)
            exit(1)
        }
        view.takeSnapshot(with: nil) { image, error in
            if let image = image, let tiff = image.tiffRepresentation,
               let bitmap = NSBitmapImageRep(data: tiff), let png = bitmap.representation(using: .png, properties: [:]) {
                try? png.write(to: destination.appendingPathComponent("presentation.png"))
            } else {
                fputs("Screenshot unavailable: \(String(describing: error))\n", stderr)
            }
            let failures = report["failures"] as? [String] ?? ["No result"]
            exit(failures.isEmpty ? 0 : 1)
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        fputs("Navigation failed: \(error)\n", stderr)
        exit(1)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // WebKit can notify same-document fragment navigations too. Never restart a probe.
        guard !started else { return }
        started = true
        print("Loaded: \(webView.url?.absoluteString ?? "unknown")"); fflush(stdout)
        let probe = #"""
        void (async () => {
          const failures = [], checks = [];
          const check = (name, condition) => { (condition ? checks : failures).push(name); window.webkit.messageHandlers.progress.postMessage((condition ? 'PASS ' : 'FAIL ') + name); };
          const settle = () => new Promise(resolve => setTimeout(resolve, 80));
          const visible = () => [...document.querySelectorAll('[data-slide]')].filter(slide => !slide.hidden && getComputedStyle(slide).display !== 'none');
          const go = async hash => {
            if (location.hash === hash) return;
            await new Promise(resolve => {
              addEventListener('hashchange', resolve, {once:true});
              location.hash = hash;
            });
          }; 
          const key = value => { document.activeElement?.blur(); document.dispatchEvent(new KeyboardEvent('keydown', {key: value, bubbles: true})); };
          try {
            await settle();
            check('player initializes', document.body.classList.contains('deck-ready'));
            check('exactly one visible slide', visible().length === 1);
            check('one semantic h1', document.querySelectorAll('h1').length === 1);
            const slides = [...document.querySelectorAll('[data-slide]')];
            check('complete deck', slides.length >= \#(minSlides) && slides.length <= \#(maxSlides));
            await go('#' + Math.min(7, slides.length));
            check('numeric deep link #7', visible()[0]?.id === '7' && location.hash === '#7');
            const select = document.querySelector('#slide-select');
            select.value = '3';
            select.dispatchEvent(new Event('change', {bubbles: true}));
            await settle();
            check('selector navigation', visible()[0]?.id === '3');
            await go('#' + Math.min(7, slides.length));
            history.back();
            await settle();
            check('browser back', visible()[0]?.id === '3');
            history.forward();
            await settle();
            check('browser forward', visible()[0]?.id === '7');
            key('Home'); await settle();
            check('Home first slide', visible()[0]?.id === '1');
            key('End'); await settle();
            check('End final slide', visible()[0]?.id === String(slides.length));
            key('Home'); await settle();
            const before = location.hash;
            for (let step = 0; step < 5 && location.hash === before; step++) { key('ArrowRight'); await settle(); }
            check('keyboard advances after progressive steps', location.hash !== before);
            const after = Number(location.hash.slice(1));
            key('ArrowLeft'); await settle();
            check('keyboard goes back', Number(location.hash.slice(1)) <= after);
            document.querySelector('#index-toggle').click();
            check('index dialog opens', document.querySelector('#slide-index').open);
            const indexLink = document.querySelector('#index-links a[href="#7"]');
            check('numeric links in index', !!indexLink);
            indexLink?.click(); await settle();
            check('index navigates and closes', visible()[0]?.id === '7' && !document.querySelector('#slide-index').open);
            const notesToggle = document.querySelector('#notes-toggle');
            if (notesToggle) {
              notesToggle.click();
              check('notes toggle', notesToggle.getAttribute('aria-pressed') === 'true');
              check('notes actually visible', getComputedStyle(visible()[0].querySelector('.speaker-notes')).display !== 'none');
              notesToggle.click();
            }
            const unchanged = location.hash;
            select.focus(); select.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true}));
            await settle();
            check('select retains keyboard behavior', location.hash === unchanged);
            select.blur();
            await go('#not-a-slide');
            check('invalid hash recovers', visible().length === 1 && /^#\d+$/.test(location.hash));
            await go('#999999');
            check('out-of-range hash recovers', visible().length === 1 && Number(location.hash.slice(1)) <= slides.length);
            await go('#' + Math.min(7, slides.length));
            key('ArrowRight'); key('ArrowRight'); key('ArrowLeft'); await settle();
            check('rapid navigation leaves one slide', visible().length === 1);
            check('no horizontal page overflow', document.documentElement.scrollWidth <= innerWidth + 2);
            check('tabular examples retain table layout', [...document.querySelectorAll('table')].every(table => getComputedStyle(table).display === 'table'));
            let clipped = [];
            for (const slide of slides) {
              await go('#' + slide.id);
              const rect = slide.getBoundingClientRect();
              if (slide.scrollWidth > slide.clientWidth + 3) clipped.push(slide.id + ':horizontal');
              if (rect.bottom > innerHeight + 3) clipped.push(slide.id + ':belowViewport');
              if (slide.scrollHeight > slide.clientHeight + 3 && !['auto','scroll'].includes(getComputedStyle(slide).overflowY)) clipped.push(slide.id + ':unscrollable');
            }
            check('all slides readable within scrollable canvas', clipped.length === 0);
            await go('#' + (window.__sddCaptureSlide || 1));
            // Decks may run decorative infinite animations; those cannot be finished.
            document.getAnimations().forEach(animation => { try { animation.finish(); } catch { animation.pause(); animation.currentTime = 1200; } });
            window.webkit.messageHandlers.result.postMessage({checks, failures, slides: slides.length, viewport: [innerWidth,innerHeight], clipped, title:document.title});
          } catch (error) {
            failures.push(String(error.stack || error));
            window.webkit.messageHandlers.result.postMessage({checks, failures});
          }
        })();
        """#
        webView.evaluateJavaScript(probe) { _, error in
            if let error = error {
                fputs("Probe execution failed: \(error)\n", stderr)
                exit(1)
            }
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let probe = BrowserProbe()
let config = WKWebViewConfiguration()
config.userContentController.add(probe, name: "result")
config.userContentController.add(probe, name: "progress")
config.userContentController.addUserScript(WKUserScript(source: "window.__sddCaptureSlide = \(captureSlide);", injectionTime: .atDocumentStart, forMainFrameOnly: true))
probe.view = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: height), configuration: config)
probe.view.navigationDelegate = probe
probe.window = NSWindow(contentRect: probe.view.frame, styleMask: [.borderless], backing: .buffered, defer: false)
probe.window.contentView = probe.view
probe.window.setFrameOrigin(NSPoint(x: 40, y: 40))
probe.window.orderFront(nil)
if input.hasPrefix("http://") || input.hasPrefix("https://") {
    probe.view.load(URLRequest(url: URL(string: input)!))
} else {
    let file = URL(fileURLWithPath: input)
    probe.view.loadFileURL(file, allowingReadAccessTo: file.deletingLastPathComponent())
}
DispatchQueue.main.asyncAfter(deadline: .now() + 100) {
    fputs("Browser probe timed out\n", stderr)
    exit(1)
}
app.run()
