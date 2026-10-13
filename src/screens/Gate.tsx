import { useState } from 'preact/hooks';
import { Icon } from '../components/icons';
import { VanSide } from '../illus/van';
import { status, useStore } from '../lib/store';
import { setName } from '../lib/sync';

/** First visit on a phone: ask who is using it. No accounts, no passwords. */
export function Gate() {
  useStore();
  const [name, set] = useState('');
  if (status.auth === 'loading') return <div class="gate"><p class="muted">Loading…</p></div>;
  return (
    <div class="gate anim-in">
      <div class="brand" style="font-size:30px;margin-bottom:12px"><span class="brand-mark" style="width:44px;height:44px"><Icon name="van" /></span>Van Fix</div>
      <VanSide caption="2012 Sprinter 2500 · horn, A/C & trailer lights" tag="" />
      <form class="card" style="margin-top:16px" onSubmit={(e) => { e.preventDefault(); if (name.trim()) setName(name); }}>
        <h2>Who’s working on the van?</h2>
        <p class="muted">Your name goes on the readings and notes you add, so everyone knows who measured what.</p>
        <label class="field"><span>Your name</span><input class="input" value={name} onInput={(e) => set((e.target as HTMLInputElement).value)} placeholder="e.g. Dad" required autoFocus /></label>
        <button type="submit" class="btn primary block" style="margin-top:14px" disabled={!name.trim()}><Icon name="next" />Start</button>
      </form>
    </div>
  );
}
