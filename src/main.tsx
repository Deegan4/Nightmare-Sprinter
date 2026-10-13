import { render } from 'preact';
import './styles.css';
import { DEMO } from './lib/sync';
// Bundled fonts for the real app; the demo artifact loads the same faces from Google Fonts.
if (!DEMO) import('./fonts.css');
import { App } from './App';
import { boot } from './lib/sync';
import { applyTheme } from './lib/theme';

applyTheme();
render(<App />, document.getElementById('app')!);
boot();

if ('serviceWorker' in navigator && import.meta.env.PROD && !DEMO) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
