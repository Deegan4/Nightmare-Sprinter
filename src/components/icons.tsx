// Hand-drawn 24px stroke icons (no icon library, keeps the bundle small).
const P: Record<string, string> = {
  next: 'M4 12h13M12 6l6 6-6 6M20 4v16',
  plan: 'M9 6h11M9 12h11M9 18h11M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M4 18h2',
  suspects: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 21 21M8.5 9a2 2 0 1 1 2.6 1.9c-.6.2-.6.6-.6 1.1M10.5 14h.01',
  codes: 'M4 5h16v11H4zM8 20h8M12 16v4M7 9h2M7 12h4M13 9h4M15 12h2',
  library: 'M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3M8 7h7M8 10.5h5',
  more: 'M5 12h.01M12 12h.01M19 12h.01M4 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
  plus: 'M12 4v16M4 12h16',
  meter: 'M6 2.5h12a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1zM8 5h8v5H8zM12 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 15l1.2-1.2',
  camera: 'M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  note: 'M5 3h10l4 4v14H5zM15 3v4h4M8 11h8M8 15h8M8 19h5',
  check: 'M4.5 12.5l5 5L19.5 7',
  x: 'M6 6l12 12M18 6 6 18',
  warn: 'M12 3 2 20h20zM12 10v4.5M12 17.5h.01',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7.5h.01',
  chev: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  copy: 'M8 8h12v12H8zM16 8V4H4v12h4',
  share: 'M12 3v12M7 8l5-5 5 5M5 13v7h14v-7',
  print: 'M6 9V3h12v6M6 18H4v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7h-2M7 14h10v7H7z',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  van: 'M2 16V8a2 2 0 0 1 2-2h11l5 4.5V16zM15 6v5h5M6.5 18.5a1.8 1.8 0 1 0 0-.01M16.5 18.5a1.8 1.8 0 1 0 0-.01M5 9h6',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  download: 'M12 3v12M7 10l5 5 5-5M5 20h14',
  zoomin: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6',
  zoomout: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 21 21M7.5 10.5h6',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  horn: 'M3 10v4h3l7 5V5L6 10zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  snow: 'M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2',
  trailer: 'M2 7h14v9H2zM16 13h4l2 2M5.5 18.5a1.8 1.8 0 1 0 0-.01M12.5 18.5a1.8 1.8 0 1 0 0-.01',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  ground: 'M12 3v9M5 12h14M7.5 15.5h9M10 19h4',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM3.5 21a8.5 8.5 0 0 1 17 0',
  book: 'M12 6.5C10 5 7 4.5 3 5v14c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5v14',
  sync: 'M20 11a8 8 0 0 0-14.3-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.5L20 16M20 20v-4h-4',
  pin: 'M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  question: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.8M12 17h.01',
  scan: 'M3 4h18v12H3zM6 20h12M12 16v4M7 8l2 2-2 2M11 12h4',
};

export function Icon({ name, label, class: cls }: { name: keyof typeof P | string; label?: string; class?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      class={cls} aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined} aria-label={label}>
      <path d={P[name] ?? P.info} />
    </svg>
  );
}
