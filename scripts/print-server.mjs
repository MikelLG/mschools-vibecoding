#!/usr/bin/env node
/**
 * Vibe Coding — Local Print Server
 *
 * Watches Firestore printQueue for pending tickets and prints silently.
 * Exposes http://localhost:3131/health so /screen detects it and skips popups.
 *
 * First run:  node scripts/setup-print-server.mjs
 * Every day:  npm run print-server
 */

import { createServer }           from 'http';
import { existsSync, readFileSync } from 'fs';
import { unlink }                 from 'fs/promises';
import { tmpdir }                 from 'os';
import { join, dirname }          from 'path';
import { fileURLToPath }          from 'url';

const __DIR = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__DIR, '..');

// ── .env.local ────────────────────────────────────────────────────────────────
const envPath = join(ROOT, '.env.local');
if (!existsSync(envPath)) {
  console.error('❌  .env.local not found. Run from project root.');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

// ── Config ────────────────────────────────────────────────────────────────────
const configPath = join(__DIR, 'print-server.config.json');
if (!existsSync(configPath)) {
  console.error('❌  Config missing. Run: node scripts/setup-print-server.mjs');
  process.exit(1);
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// ── Firebase ──────────────────────────────────────────────────────────────────
const { initializeApp }    = await import('firebase/app');
const {
  getFirestore, collection, query, where, onSnapshot, updateDoc, doc,
} = await import('firebase/firestore');

const db = getFirestore(initializeApp({
  apiKey:            env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.NEXT_PUBLIC_FIREBASE_APP_ID,
}));

// ── Puppeteer + pdf-to-printer ────────────────────────────────────────────────
const puppeteer              = (await import('puppeteer')).default;
const { print: silentPrint } = await import('pdf-to-printer');

// ── State ─────────────────────────────────────────────────────────────────────
const processing = new Set();   // IDs already enqueued (avoid duplicates)
const jobQueue   = [];          // sequential FIFO print queue
let   isRunning  = false;       // true while a ticket is being printed
let   pendingCount = 0;

// ── Health server ─────────────────────────────────────────────────────────────
const httpServer = createServer((req, res) => {
  const headers = {
    'Content-Type':                     'application/json',
    'Access-Control-Allow-Origin':      '*',
    'Access-Control-Allow-Methods':     'GET, OPTIONS',
    'Access-Control-Allow-Private-Network': 'true',
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, headers); return res.end(); }
  if (req.url === '/health') {
    res.writeHead(200, headers);
    res.end(JSON.stringify({ ok: true, printer: config.printerName, pending: pendingCount }));
  } else {
    res.writeHead(404, headers);
    res.end('{}');
  }
});

httpServer.listen(3131, () => {
  const sep = '─'.repeat(54);
  console.log(`\n🖨️   Vibe Coding — Print Server`);
  console.log(sep);
  console.log(`  Printer  : ${config.printerName}`);
  console.log(`  Webapp   : ${config.serverUrl}`);
  console.log(`  Health   : http://localhost:3131/health`);
  console.log(sep);
  console.log('\n  Listening for tickets... (Ctrl+C to stop)\n');
});

// ── Firestore listener ────────────────────────────────────────────────────────
onSnapshot(
  query(collection(db, 'printQueue'), where('status', '==', 'pending')),
  snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added' && !processing.has(change.doc.id)) {
        processing.add(change.doc.id);
        pendingCount++;
        jobQueue.push({ queueId: change.doc.id, item: change.doc.data() });
        drain();
      }
    });
  },
  err => console.error('⚠️  Firestore error:', err.message)
);

// Process jobs one at a time in FIFO order
function drain() {
  if (isRunning || jobQueue.length === 0) return;
  isRunning = true;
  const { queueId, item } = jobQueue.shift();
  printTicket(queueId, item).finally(() => {
    isRunning = false;
    drain(); // next job
  });
}

// ── Print ─────────────────────────────────────────────────────────────────────
async function printTicket(queueId, item) {
  const label = item.pairName || `#${queueId.slice(0, 8)}`;
  const ts = () => new Date().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  console.log(`⏳ [${ts()}] Rebut: "${label}" — renderitzant...`);

  try {
    await updateDoc(doc(db, 'printQueue', queueId), { status: 'printing' });

    // Render the existing /print/[queueId] page with headless Chromium
    const browser = await puppeteer.launch({ headless: true });
    const page    = await browser.newPage();
    await page.goto(`${config.serverUrl}/print/${queueId}`, {
      waitUntil: 'networkidle0',
      timeout:   30_000,
    });

    // Generate PDF at thermal receipt width (80mm)
    const pdfPath = join(tmpdir(), `vibe-ticket-${queueId}.pdf`);
    await page.pdf({
      path:            pdfPath,
      width:           '80mm',
      printBackground: true,
      margin:          { top: 0, right: 0, bottom: '4mm', left: 0 },
    });
    await browser.close();

    // Print silently (pdf-to-printer uses SumatraPDF on Windows, lp on Mac/Linux)
    await silentPrint(pdfPath, { printer: config.printerName, silent: true });
    await unlink(pdfPath).catch(() => {});

    await updateDoc(doc(db, 'printQueue', queueId), { status: 'printed', printedAt: Date.now() });
    console.log(`✅ [${ts()}] Imprès: "${label}"`);

  } catch (err) {
    console.error(`❌ [${ts()}] Error "${label}": ${err.message}`);
    await updateDoc(doc(db, 'printQueue', queueId), { status: 'error' }).catch(() => {});
  } finally {
    processing.delete(queueId);
    pendingCount = Math.max(0, pendingCount - 1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGINT',  () => { console.log('\n👋  Print server stopped.'); httpServer.close(); process.exit(0); });
process.on('SIGTERM', () => { httpServer.close(); process.exit(0); });
