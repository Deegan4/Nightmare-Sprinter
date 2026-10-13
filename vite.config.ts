import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { readFileSync } from 'node:fs';

/** Emit sw.js with the exact list of built files so the shell works offline after one visit. */
function serviceWorker(): Plugin {
  return {
    name: 'van-fix-sw',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !f.endsWith('.woff') && !f.startsWith('sw'));
      const precache = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', ...files.map((f) => '/' + f)];
      const tpl = readFileSync('scripts/sw-template.js', 'utf8');
      const version = Date.now().toString(36);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: tpl.replace('__PRECACHE__', JSON.stringify([...new Set(precache)])).replace('__VERSION__', version) });
    },
  };
}

export default defineConfig({
  plugins: [preact(), serviceWorker()],
  build: {
    target: 'es2020', sourcemap: false, assetsInlineLimit: 0,
    // The demo page is a single HTML file, so it can't load split chunks.
    rollupOptions: process.env.VITE_DEMO === '1' ? { output: { inlineDynamicImports: true } } : {},
  },
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
});
