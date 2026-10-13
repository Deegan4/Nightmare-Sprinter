# Van Fix 🚐⚡

A private, installable web app for fixing one van: a 2012 Freightliner Sprinter 2500 whose
**horn, A/C compressor and trailer lights all stopped at the same time**. Kollin (iPhone) and his dad
(Android) use it side by side: what to do next, readings with PASS/FAIL against simple rules, suspects,
fault codes, wiring reference pages, a van map, and a timeline. Works offline and syncs when signal returns.

## What's in it
- **Next**: the one next step, big, with a drawing of where on the van it happens.
- **Plan**: 5 seeded test steps, each with where-to-look drawings and "how to hook up the meter" diagrams.
- **Readings**: big number entry, unit + condition chips, live PASS / FAIL / CHECK against the rule.
- **Suspects**: the 5 hypotheses, a symptom-to-suspect map, evidence for/against.
- **Codes**: the 2026-10-09 TOPDON codes, with a "never clear before logging" guard.
- **Library**: wiring/fuse/ground page images from the private manuals, pinch-zoom, provenance + source on every page.
- **Wiring sheet**: one page in the reference-infographic layout (components, power flow, fuse tables, horn / A/C / trailer circuits, real photos, quick steps), filled from the manuals.
- **Map**: top-down and side views of the van with numbered points, a circuit overview built only from
  sourced facts, and **real photos you can tap to mark where each part actually is** (turns "approximate" into "confirmed").
- **Copy summary / print** for Claude or a mechanic. Export all data as JSON.

## First-time setup (Cloudflare, free tier)
```bash
npm install
npx wrangler login
npx wrangler d1 create van-fix            # paste the database_id into wrangler.toml
npx wrangler r2 bucket create van-fix
npm run db:migrate:remote
npx wrangler secret put OWNER_KEY        # a long random string only you know
npm run deploy
```
Then on your phone open `https://<your-worker>.workers.dev/#/setup`, enter the owner key and your name.
Go to **More → Invite & people → Create link** and text the link to Dad. He just types his name.

### Add the manual pages (private)
Download two PDFs from your Google Drive into `reference-source/` (git-ignored):
`System Wiring Diagram.pdf` → `reference-source/system-wiring.pdf` and
`Wiring Diagrams (Fuse Block, Grounds).pdf` → `reference-source/fuse-grounds.pdf`. Then:
```bash
scripts/load-manual-pages.sh --remote
```
That uploads every Library figure (horn, trailer, A/C, power distribution, grounds, fuse/relay box) at the right pages.
No R2 bucket? Photos, manual pages and backups are stored in D1 instead. Load pages with
`STORAGE=d1 scripts/load-manual-pages.sh --remote`.

### Current live deployment
Deployed with `wrangler deploy --temporary -c wrangler.temporary.toml` (no-login preview account, D1 file storage).
Seed SQL: `node scripts/seed-sql.mjs`. Claim the account from the claim URL Wrangler prints to keep it.

## Develop
See `CLAUDE.md` for all commands, the data model and the hard rules (provenance labels, no invented fuse numbers).
