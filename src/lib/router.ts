import { useEffect, useState } from 'preact/hooks';

const parse = () => (location.hash.replace(/^#\/?/, '') || '').split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);

export function useRoute(): string[] {
  const [r, set] = useState(parse());
  useEffect(() => {
    const h = () => { set(parse()); window.scrollTo(0, 0); };
    addEventListener('hashchange', h);
    return () => removeEventListener('hashchange', h);
  }, []);
  return r;
}
export const go = (path: string) => { location.hash = '#' + path; };
export const href = (path: string) => '#' + path;
