import { useState } from 'preact/hooks';
import { Icon } from '../components/icons';
import { VanSide } from '../illus/van';
import { status, useStore } from '../lib/store';
import { api, signIn } from '../lib/sync';

export function Gate({ route }: { route: string[] }) {
  useStore();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const mode = route[0] === 'setup' ? 'setup' : route[0] === 'join' && route[1] ? 'join' : 'out';

  if (status.auth === 'loading') return <div class="gate"><p class="muted">Loading…</p></div>;

  const submit = async (e: Event) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const body = mode === 'setup' ? { key, name } : { token: route[1], name };
      const r = await api<{ member: any }>(mode === 'setup' ? '/api/setup' : '/api/join', { method: 'POST', body: JSON.stringify(body) });
      await signIn(r.member);
    } catch (e) {
      setErr((e as Error).message === 'Failed to fetch' ? 'No connection. Try again when you have signal.' : (e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div class="gate anim-in">
      <div class="brand" style="font-size:30px;margin-bottom:12px"><span class="brand-mark" style="width:44px;height:44px"><Icon name="van" /></span>Van Fix</div>
      <VanSide caption="2012 Sprinter 2500 · horn, A/C & trailer lights" tag="" />
      {mode === 'out' ? (
        <div class="card" style="margin-top:16px">
          <h2>{status.auth === 'revoked' ? 'You’ve been signed out' : 'Private app'}</h2>
          <p>{status.auth === 'revoked' ? 'This invite link was turned off. Ask Kollin for a new link.' : 'Open the invite link Kollin sent you to join.'}</p>
          {status.auth === 'in' && <a class="btn primary block" href="#/">Continue as {status.me?.display_name}</a>}
        </div>
      ) : (
        <form class="card" style="margin-top:16px" onSubmit={submit}>
          <h2>{mode === 'setup' ? 'Owner setup' : 'Join the repair'}</h2>
          <p class="muted">{mode === 'setup' ? 'Enter the owner key you set with wrangler secret.' : 'You were invited to help fix the van. Just enter your name.'}</p>
          {status.auth === 'in' && <p class="small">You are already signed in as <b>{status.me?.display_name}</b>. <a href="#/">Continue</a></p>}
          {mode === 'setup' && <label class="field"><span>Owner key</span><input class="input" type="password" value={key} onInput={(e) => setKey((e.target as HTMLInputElement).value)} required /></label>}
          <label class="field"><span>Your name</span><input class="input" value={name} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder="e.g. Dad" required autoFocus /></label>
          {err && <p style="color:var(--fail);font-weight:700">{err}</p>}
          <button type="submit" class="btn primary block" style="margin-top:14px" disabled={busy}><Icon name="next" />{busy ? 'Joining…' : mode === 'setup' ? 'Set up' : 'Join'}</button>
        </form>
      )}
    </div>
  );
}
