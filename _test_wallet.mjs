import puppeteer from 'puppeteer';
import bs58 from 'bs58';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nacl = require('/Users/navy/Documents/Game/2d-multiplayer-survival-mmorpg/auth-server-openauth/node_modules/tweetnacl');

const OUT = '/private/tmp/claude-501/-Users-navy-Documents-Game-2d-multiplayer-survival-mmorpg/5f6d08cc-121b-4e4e-a885-a12e927ff4c0/scratchpad';
const naclSrc = fs.readFileSync('/Users/navy/Documents/Game/2d-multiplayer-survival-mmorpg/auth-server-openauth/node_modules/tweetnacl/nacl-fast.min.js', 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const kp = nacl.sign.keyPair();
const pubB58 = bs58.encode(kp.publicKey);
const secretArr = Array.from(kp.secretKey);
const logs = [];

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-webgl'],
  defaultViewport: { width: 1600, height: 1000 },
});
const page = await browser.newPage();
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
const txt = async () => { try { return await page.evaluate(() => document.body?.innerText || ''); } catch { return ''; } };
const shot = async (n) => { try { await page.screenshot({ path: `${OUT}/${n}` }); logs.push(`[shot] ${n}`); } catch (e) { logs.push(`[shot-fail] ${e.message}`); } };

try {
  await page.goto('http://localhost:3008/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((e) => logs.push(`[goto] ${e.message}`));
  for (let i = 0; i < 20; i++) { if (/Connect Solana Wallet/i.test(await txt())) break; await sleep(1000); }
  // Inject nacl + mock Phantom provider
  await page.addScriptTag({ content: naclSrc });
  await page.evaluate((pub, sec) => {
    const n = window.nacl;
    const secretKey = new Uint8Array(sec);
    const pk = { toString: () => pub, toBytes: () => window.nacl.sign.keyPair ? undefined : undefined };
    window.solana = {
      isPhantom: true,
      publicKey: pk,
      isConnected: true,
      connect: async () => ({ publicKey: pk }),
      disconnect: async () => {},
      on: () => {}, off: () => {}, removeListener: () => {},
      signMessage: async (msg) => ({ signature: n.sign.detached(new Uint8Array(msg), secretKey), publicKey: pk }),
    };
  }, pubB58, secretArr);
  logs.push('[step] mock Phantom injected');

  // Click Connect Solana Wallet
  const c1 = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x => /connect solana wallet/i.test(x.textContent||'')); if (b){b.click();return true;} return false; });
  logs.push(`[step] clicked Connect=${c1}`);

  // Wait for authenticated/registration screen (character picker or Join Game)
  let authed = false;
  for (let i = 0; i < 25; i++) { const t = await txt(); if (/Choose Your Character|Join Game|Welcome back/i.test(t)) { authed = true; break; } if (/Wallet sign-in|signature|failed/i.test(t)) { logs.push(`[authErr] ${t.slice(0,160)}`); break; } await sleep(1000); }
  logs.push(`[state] reachedRegistration=${authed}`);
  await sleep(1500);
  await shot('w1_after_connect.png');

  if (authed) {
    // pick character 2 (Azure) if picker present, fill username, click Join
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const az = btns.find(b => /azure/i.test(b.getAttribute('title')||'') || /azure/i.test(b.textContent||''));
      if (az) az.click();
      const input = document.querySelector('input[placeholder="Enter username"]');
      if (input) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(input,'TestHero'); input.dispatchEvent(new Event('input',{bubbles:true})); }
    });
    await sleep(800);
    await shot('w2_picker.png');
    const cj = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(x => /join game/i.test(x.textContent||'')); if (b){b.click();return true;} return false; });
    logs.push(`[step] clicked JoinGame=${cj}`);
    // wait for in-game (no spectator banner, canvas, HUD)
    for (let i = 0; i < 25; i++) { const t = await txt(); if (/NEURAL UPLINK/i.test(t) && !/Connect Solana|Choose Your Character/i.test(t)) break; await sleep(1000); }
    await sleep(6000);
    await shot('w3_ingame.png');
    const dom = await page.evaluate(() => ({ hasCanvas: !!document.querySelector('canvas'), txt: (document.body.innerText||'').slice(0,140) })).catch(()=>({}));
    logs.push(`[dom] ${JSON.stringify(dom)}`);
  }
} finally {
  console.log('=== KEY LOGS ===');
  console.log(logs.filter(l => /step|state|authErr|GameConn|Connection|isSpacetimeReady|register|Solana|pageerror|dom|shot|token|Auth/i.test(l)).slice(-50).join('\n'));
  await browser.close();
}
