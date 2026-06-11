#!/usr/bin/env node
/**
 * Vibe Coding — Print Server Setup
 * Run once on any facilitator computer: node scripts/setup-print-server.mjs
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __DIR = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__DIR, '..');
const CONFIG = join(__DIR, 'print-server.config.json');
const IS_WIN = platform() === 'win32';

function ask(rl, question, def = '') {
  const prompt = def ? `${question} [${def}]: ` : `${question}: `;
  return new Promise(r => rl.question(prompt, a => r(a.trim() || def)));
}

function run(cmd, opts = {}) {
  const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', ...opts });
  return out?.trim() ?? '';
}

async function checkPkg(name) {
  try {
    const pkg = join(ROOT, 'node_modules', name, 'package.json');
    JSON.parse(readFileSync(pkg, 'utf8'));
    return true;
  } catch { return false; }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   🖨️   Vibe Coding — Print Server Setup                ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  // ── 1. Node version ───────────────────────────────────────────────────────
  const nodeVer = parseInt(process.version.slice(1));
  if (nodeVer < 18) {
    console.error(`❌  Node.js 18+ required. You have ${process.version}.\n    Download: https://nodejs.org`);
    rl.close(); process.exit(1);
  }
  console.log(`✅  Node.js ${process.version}`);

  // ── 2. .env.local ─────────────────────────────────────────────────────────
  if (!existsSync(join(ROOT, '.env.local'))) {
    console.error('\n❌  .env.local not found.');
    console.error('    Copy it from the project repo or ask the lead developer.');
    rl.close(); process.exit(1);
  }
  console.log('✅  .env.local found');

  // ── 3. Install packages ───────────────────────────────────────────────────
  console.log('\n📦  Checking required packages...');
  const missing = [];
  for (const pkg of ['puppeteer', 'pdf-to-printer']) {
    const ok = await checkPkg(pkg);
    console.log(`  ${ok ? '✅' : '⬇️ '}  ${pkg}${ok ? '' : ' — will install'}`);
    if (!ok) missing.push(pkg);
  }

  if (missing.length > 0) {
    console.log(`\n⏳  Installing: ${missing.join(', ')}`);
    if (missing.includes('puppeteer')) {
      console.log('    Puppeteer downloads Chromium (~150 MB) — please wait...\n');
    }
    try {
      run(`npm install --save-dev ${missing.join(' ')}`, { stdio: 'inherit' });
      console.log('\n✅  Packages installed.');
    } catch (e) {
      console.error('\n❌  npm install failed:', e.message);
      rl.close(); process.exit(1);
    }
  }

  // ── 4. Detect printers ────────────────────────────────────────────────────
  console.log('\n🖨️   Detecting system printers...');
  let printers = [];

  try {
    if (IS_WIN) {
      const out = run('powershell -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name | ConvertTo-Json -Compress"');
      const parsed = JSON.parse(out);
      printers = (Array.isArray(parsed) ? parsed : [parsed]).filter(Boolean);
    } else {
      // macOS / Linux
      const out = run("lpstat -p 2>/dev/null | awk '{print $2}'");
      printers = out.split('\n').filter(Boolean);
    }
  } catch {
    console.log('  ⚠️  Could not auto-detect printers. You will enter the name manually.');
  }

  let printerName = '';

  if (printers.length > 0) {
    console.log('\n  Available printers:');
    printers.forEach((p, i) => console.log(`    ${String(i + 1).padStart(2)}. ${p}`));
    const choice = await ask(rl, '\n  Select number (or 0 to type manually)', '1');
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && printers[idx]) printerName = printers[idx];
  }

  if (!printerName) {
    printerName = await ask(rl, '\n  Printer name (exactly as shown in system settings)');
  }

  if (!printerName) {
    console.error('\n❌  No printer selected. Run setup again.');
    rl.close(); process.exit(1);
  }

  // ── 5. Webapp URL ─────────────────────────────────────────────────────────
  const defaultUrl = 'https://mschools-vibecoding.vercel.app';
  const serverUrl  = await ask(rl, '\n  Webapp URL (production or local dev)', defaultUrl);

  // ── 6. Save config ────────────────────────────────────────────────────────
  writeFileSync(CONFIG, JSON.stringify({ printerName, serverUrl }, null, 2));

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║   ✅  Setup complete!                                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\n  Printer : ${printerName}`);
  console.log(`  Webapp  : ${serverUrl}`);
  console.log('\n  ─────────────────────────────────────────────────────');
  console.log('  Each workshop day, run:');
  console.log('\n    npm run print-server\n');
  console.log('  Then open /screen — you\'ll see a green "Servidor actiu" badge.');
  console.log('  Tickets will print automatically without browser popups.\n');

  rl.close();
}

main().catch(err => {
  console.error('\n❌  Setup error:', err.message);
  process.exit(1);
});
