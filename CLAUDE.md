# Van Fix (Sprinter repair tracker)

Open (no accounts), mobile-first PWA for diagnosing ONE 2012 Sprinter 2500 (horn, A/C compressor and
trailer lights all dead). Spec: the PRD in the first PR description / README.

## Commands
- `npm install`
- `npm run dev` – Vite on :5173 (proxies `/api` to wrangler on :8787)
- `npm run dev:worker` – `wrangler dev` (serves `dist/` + API with local D1/R2). No secrets needed
- `npm run db:migrate:local` / `npm run db:migrate:remote`
- `npm run build` – web build into `dist/` (also emits `sw.js`)
- `npm run build:demo` – device-only demo build (no server, `VITE_DEMO=1`) into `dist-demo/`
- `npm run typecheck`, `npm test` (vitest: rule engine, seed, summary)
- E2E acceptance tests: `./scripts/reset-local.sh && npm run build && npm run dev:worker` then `node tests/e2e.mjs [shotsDir]`
- Deploy: `npm run deploy` (see README for first-time Cloudflare setup)
- Reference pages: `scripts/pdf-to-images <pdf> <ref-id> <first> [last] --remote`

## Layout
- `shared/` – types, seed content (from the PRD), rule engine, copy-summary builder. Used by worker and web.
- `worker/index.ts` – Hono API on Cloudflare Workers, D1 (`records`, `rate`, `blob_chunks`), R2 if bound (photos, reference images, nightly backups); otherwise files go to D1 `blob_chunks`. No auth: anyone with the URL can use it; writes are rate-limited per IP.
- `src/` – Preact SPA. `lib/` store/sync/IndexedDB, `screens/`, `illus/` (all SVG drawings), `components/`.
  `illus/xray.tsx` + `screens/Xray.tsx` = see-through view (#/xray): every node cites its source; lines are connections, not routes.
- `migrations/` – D1 SQL.

## Data model decision
Every synced object is one row in `records` (`id, kind, data JSON, created_at, updated_at, created_by, deleted, seq`).
Kinds: vehicle, fact, step, reading, rule, suspect, evidence, fault_code, reference_page, zone, photo, note, event.
Client-generated ids + last-write-wins on `updated_at` = idempotent retries, no duplicates. `seq` is assigned
inside the same D1 batch transaction so `/api/sync?since=` never skips rows. `event` rows are append-only.
`ensureSeeded` inserts missing seed rows and refreshes seed rows nobody edited (updated_at = created_at) when the seed text changes;
to replace a seed row with a new id, add the old id to `RETIRED_SEED_IDS`.

## Hard rules (from the PRD — do not break)
- Never present a guess as fact. Every fact/reading/reference shows a provenance label
  (CONFIRMED / REPORTED / HYPOTHESIS / SOURCE / UNKNOWN). Don't upgrade seeded labels in code.
- Readings say "meets / does not meet the rule", never "part is bad".
- Do NOT invent fuse numbers, pinouts, wire colours or connector cavities. Drawings in `src/illus/`
  are tagged APPROXIMATE or CONCEPT; real locations come from photos people mark in the app.
- The earlier AI-generated "wiring diagram" infographic must not be added. Its LAYOUT is what the
  Wiring Sheet (`src/screens/Sheet.tsx`) copies; its DATA is not used. Checked against the manuals:
  its F55/4 fuse 14 (20 A trailer socket) and fuse 15 (25 A AAG) match, but its "main fuse box F1-F5",
  "horn relay in engine-bay box", "A/C clutch relay" and "F55/3-9 7.5 A A/C" do not.

## Where the real data comes from
The owner's manuals are in their Google Drive (shared by gadget.manual@gmail.com):
- "System Wiring Diagram.pdf" (cardiagn.com set, 94 pp): Fig. 1-3 A/C p.2-4, Fig. 24 trailer p.33,
  Fig. 25-27 grounds p.35-37, Fig. 30 horn p.42, Fig. 38-42 power distribution p.54-58.
- "Wiring Diagrams (Fuse Block, Grounds).pdf" (Mercedes format, 111 pp, has a text layer): fuse/relay box
  K40/9 legend (US version PE54.15-D-2001-97AB), F55/1-7 fuse block legends, ground point legends.
Also used: "Equipment & Instructions.pdf" (battery G1 under driver-footwell floor Fig. 2, battery check
> 12.4 V, SCN coding needs STAR/Xentry, PSM N26/15 in seat frame Fig. 27), "Maintenance.pdf" (horn check: both
switches), "Wiring Diagrams - Body.pdf" Fig. 6 (turn signal over CAN B to N28/1), "Wiring Diagrams.pdf" Fig. 29
(compressor A9 pin 1 BU/GN → X26/38 pin 7 → X18/56 pin 23 → S98 pin 5). "Testing & Repair - Body" and
"Wheels..." had nothing relevant. Web: Mercedes-Benz Canada "2015 Sprinter Fuse Allocation Supplement" (same W906) gives the locations the
2012 manuals lack: F59 pre-fuse box in the battery compartment, left footwell; F55/3 and F55/4 in the box on the outside of the driver
seat base. Its trailer fuse values match. Seeded as SOURCE with "(web source, confirm)". Seeded fuses/facts cite the figure they came from. `scripts/load-manual-pages.sh` uploads all Library pages.
- Manual PDFs/images are third-party: never commit them (`reference-source/` is git-ignored). The open app does not serve them:
  `/api/ref-image/*` returns 403 unless the deployment sets `SERVE_MANUALS=1` (only for a private deployment).
  Everything sends `noindex`; `robots.txt` disallows all.

## Open-question defaults chosen
- Names: each phone enters a display name once (stored locally, sent as `created_by`). No accounts, invites or roles.
- TOPDON report: stored as a REPORTED fact + codes; scanner screens can be attached as photos to codes.
- "Ask for help" email button: skipped in v1 (use Copy summary).
