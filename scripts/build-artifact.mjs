// Builds dist-demo (VITE_DEMO=1) into one self-contained HTML body for a shareable
// device-only demo page: JS and CSS inlined, fonts from Google Fonts, no server, no manuals.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = 'dist-demo';
const html = readFileSync(`${dir}/index.html`, 'utf8');
const assets = readdirSync(`${dir}/assets`);
const js = assets.filter((f) => f.endsWith('.js') && f.startsWith('index')).map((f) => readFileSync(`${dir}/assets/${f}`, 'utf8')).join('\n');
const css = assets.filter((f) => f.endsWith('.css') && f.startsWith('index')).map((f) => readFileSync(`${dir}/assets/${f}`, 'utf8')).join('\n');
const icon = readFileSync('public/icons/icon.svg', 'utf8');
const out = `<title>Van Fix</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#121417">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Barlow+Condensed:wght@600;700&display=swap">
<style>${css}</style>
<div id="app"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
if (!html.includes('id="app"')) throw new Error('unexpected index.html');
writeFileSync(process.argv[2] ?? 'van-fix-demo.html', out);
console.log('wrote demo page', (out.length / 1024).toFixed(0), 'KB');
