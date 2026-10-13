// End-to-end acceptance run against `wrangler dev` (http://127.0.0.1:8787).
// Two phones: Kollin (iPhone size) and Dad (Android size). Usage:
//   npm run build && npx wrangler dev &  then  node tests/e2e.mjs [screenshotDir]
import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';

const BASE = process.env.BASE ?? 'http://127.0.0.1:8787';
const KEY = process.env.OWNER_KEY ?? 'local-owner-key';
const SHOTS = process.argv[2];
const log = (...a) => console.log('•', ...a);

const browser = await chromium.launch();
const kollin = await browser.newContext({ ...devices['iPhone 13'], defaultBrowserType: undefined, serviceWorkers: 'block' });
const dad = await browser.newContext({ ...devices['Pixel 5'], viewport: { width: 360, height: 800 }, serviceWorkers: 'block' });
const K = await kollin.newPage();
const D = await dad.newPage();
const shot = async (p, name) => SHOTS && p.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });

// --- owner setup
await K.goto(`${BASE}/#/setup`);
await K.fill('input[type=password]', KEY);
await K.fill('input[placeholder="e.g. Dad"]', 'Kollin');
await K.click('button[type=submit]');
await K.locator('#next-title').waitFor();
log('owner set up, seed loaded, next step visible');

// --- invite link
await K.goto(`${BASE}/#/share`);
await K.getByRole('button', { name: 'Create link' }).click();
const link = await K.locator('input[readonly]').inputValue();
assert.match(link, /#\/join\/[\w-]{30,}/);
log('invite link created');

// --- AT1: Dad joins on Android, adds a reading + photo quickly
const t0 = Date.now();
await D.goto(link);
await D.fill('input[placeholder="e.g. Dad"]', 'Dad');
await D.click('button[type=submit]');
const heroTitle = D.locator('#next-title');
await heroTitle.waitFor();
const box = await heroTitle.boundingBox();
assert.ok(box && box.y + box.height < 800, 'next step visible without scrolling at 360x800');
await shot(D, '01-home-android');
await D.getByRole('button', { name: /Add reading, photo or note/ }).click();
await D.locator('.fab-item', { hasText: 'Add reading' }).click();
await D.getByRole('button', { name: /^4\. Trailer/ }).click();
await D.getByRole('button', { name: /Seat-base ground W71\/3 drop/ }).click();
await D.fill('input[inputmode=decimal]', '0.35');
await D.locator('#verdict').getByText('FAIL: does not meet the rule').waitFor();
const verdictText = await D.locator('#verdict').innerText();
assert.ok(!/is bad|faulty part|replace/i.test(verdictText), 'verdict never claims a part is bad');
await shot(D, '02-add-reading-fail');
await D.getByRole('button', { name: 'Save reading' }).click();
await D.getByRole('button', { name: /Add reading, photo or note/ }).click();
await D.locator('.fab-item', { hasText: 'Add photo' }).click();
await D.setInputFiles('.sheet input[type=file]', 'public/icons/icon-512.png');
await D.fill('.sheet input.input', 'Seat base ground');
await D.getByRole('button', { name: 'Save photo' }).click();
await D.getByText(/Saved/).first().waitFor();
const dadSecs = (Date.now() - t0) / 1000;
log(`AT1 Dad joined + reading + photo in ${dadSecs.toFixed(1)}s (automated)`);
const t1 = Date.now();
await K.goto(`${BASE}/#/`);
await K.getByText('Seat-base ground W71/3 drop').first().waitFor({ timeout: 12000 });
log(`AT1 Kollin sees Dad's reading after ${((Date.now() - t1) / 1000).toFixed(1)}s`);

// --- AT3: 0.1 V passes
await K.getByRole('button', { name: /Add reading, photo or note/ }).click();
await K.locator('.fab-item', { hasText: 'Add reading' }).click();
await K.getByRole('button', { name: /^2\. Horn/ }).click();
await K.getByRole('button', { name: /Horn ground voltage drop/ }).click();
await K.fill('input[inputmode=decimal]', '0.1');
await K.locator('#verdict').getByText('PASS: meets the rule').waitFor();
await K.getByRole('button', { name: 'Save reading' }).click();
log('AT3 0.35 V → FAIL, 0.1 V → PASS, wording is "meets / does not meet the rule"');

// --- AT2: offline on Dad's phone
await dad.setOffline(true);
await D.getByRole('button', { name: /Add reading, photo or note/ }).click();
await D.locator('.fab-item', { hasText: 'Add reading' }).click();
await D.getByRole('button', { name: /^4\. Trailer/ }).click();
await D.getByRole('button', { name: /Trailer terminal 4 constant 12 V/ }).click();
await D.fill('input[inputmode=decimal]', '12.4');
await D.getByRole('button', { name: 'Save reading' }).click();
await D.getByRole('button', { name: /Add reading, photo or note/ }).click();
await D.locator('.fab-item', { hasText: 'Add note' }).click();
await D.fill('.sheet textarea', 'Offline note: socket looked corroded');
await D.getByRole('button', { name: 'Save note' }).click();
await D.getByText(/saved on phone/).first().waitFor();
await shot(D, '03-offline-pending');
await dad.setOffline(false);
await D.evaluate(() => dispatchEvent(new Event('online')));
await K.goto(`${BASE}/#/timeline`);
await K.getByText('Offline note: socket looked corroded').waitFor({ timeout: 15000 });
await K.getByText(/Trailer terminal 4 constant 12 V: 12.4 V/).waitFor({ timeout: 15000 });
const dupes = await K.getByText('Offline note: socket looked corroded').count();
assert.equal(dupes, 1, 'no duplicates');
log('AT2 offline reading + note synced once each');

// --- AT7: summary
await K.goto(`${BASE}/#/summary`);
const summary = await K.locator('pre.summary-pre').innerText();
for (const s of ['WD3PE7CCXC5614568', 'Seat-base ground W71/3 drop: 0.35 V, Load applied', '[HYPOTHESIS]', '90B5', '[CONFIRMED]', '[REPORTED]', '[SOURCE, unverified for this VIN]']) assert.ok(summary.includes(s), `summary has ${s}`);
log('AT7 summary contains facts, readings with unit + condition, suspects, codes, provenance');

// --- AT4: every reference page has a provenance badge + source
await K.goto(`${BASE}/#/library`);
const cards = K.locator('a.item');
const n = await cards.count();
for (let i = 0; i < n; i++) { const t = await cards.nth(i).innerText(); assert.ok(/Source · unverified/i.test(t) && /\.com/.test(t), `ref ${i} shows provenance + source`); }
log(`AT4 ${n} reference pages show provenance + source`);

// --- AT6: revoke Dad's link
await K.goto(`${BASE}/#/share`);
K.on('dialog', (d) => d.accept());
await K.getByRole('button', { name: 'Revoke' }).first().click();
await K.getByText(/revoked/).first().waitFor();
await D.reload();
await D.getByText(/signed out|Private app/i).first().waitFor({ timeout: 8000 });
log('AT6 revoked member is signed out on next request');

await browser.close();
console.log('\nALL ACCEPTANCE CHECKS PASSED');
