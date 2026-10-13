import { render } from 'preact';
import './styles.css';
import { App } from './App';
import { boot } from './lib/sync';
import { applyTheme } from './lib/theme';

applyTheme();
render(<App />, document.getElementById('app')!);
boot();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
