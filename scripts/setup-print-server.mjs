#!/usr/bin/env node
/**
 * Vibe Coding — Print Server Setup
 * Run once on any facilitator computer: node scripts/setup-print-server.mjs
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __DIR = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__DIR, '..');
const CONFIG = join(__DIR, 'print-server.config.json');
const IS_WIN = platform() === 'win32';
const DRIVERS_ZIP = join(__DIR, '351002_Drivers.zip');

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

function hasPrinterInstalled(nameFragment) {
  if (!IS_WIN) return false;
  try {
    const out = run('powershell -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name"');
    return out.toLowerCase().includes(nameFragment.toLowerCase());
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

  // ── 2. Thermal printer driver ─────────────────────────────────────────────
  console.log('\n🖨️   Checking thermal printer driver (Equip 351002 / CK710)...');

  if (IS_WIN) {
    const driverFound = hasPrinterInstalled('CK710') || hasPrinterInstalled('351002');
    if (driverFound) {
      console.log('  ✅  CK710 driver already installed.');
    } else {
      console.log('  ⚠️   CK710 printer not found in Windows.');
      console.log('');

      if (existsSync(DRIVERS_ZIP)) {
        console.log('  📦  Driver ZIP found: scripts/351002_Drivers.zip');
        console.log('');
        console.log('  To install the printer driver:');
        console.log('  1. Extract: scripts\\351002_Drivers.zip');
        console.log('  2. Right-click the .inf file inside → "Install"');
        console.log('     OR run as Admin: pnputil /add-driver path\\to\\driver.inf /install');
        console.log('  3. Connect the printer via USB and turn it on');
        console.log('  4. Windows will detect it automatically');
        console.log('');

        // Try to open the ZIP in Explorer for the user
        try {
          spawnSync('explorer.exe', [DRIVERS_ZIP], { detached: true, stdio: 'ignore' });
          console.log('  📂  Opened ZIP in Explorer — install the driver, then press Enter to continue.');
        } catch {
          console.log(`  📂  Open this file manually: ${DRIVERS_ZIP}`);
        }

        await ask(rl, '\n  Press Enter once the driver is installed and the printer is connected');
      } else {
        console.log('  📦  Driver ZIP not found at scripts/351002_Drivers.zip');
        console.log('      Download drivers for Equip model 351002 and install before continuing.');
        await ask(rl, '\n  Press Enter once the driver is installed and the printer is connected');
      }
    }
  } else {
    console.log('  ℹ️   On macOS/Linux, install CUPS driver for your thermal printer manually.');
  }

  // ── 3. .env.local ─────────────────────────────────────────────────────────
  console.log('');
  if (!existsSync(join(ROOT, '.env.local'))) {
    console.error('❌  .env.local not found.');
    console.error('    Copy it from the project repo or ask the lead developer.');
    rl.close(); process.exit(1);
  }
  console.log('✅  .env.local found');

  // ── 4. Install packages ───────────────────────────────────────────────────
  console.log('\n📦  Checking required packages...');
  const missing = [];
  for (const pkg of ['puppeteer']) {
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

  // ── Ensure Puppeteer's bundled Chrome is downloaded ───────────────────────
  console.log('\n🌐  Checking Puppeteer Chrome download...');
  try {
    run('npx puppeteer browsers install chrome', { stdio: 'inherit' });
    console.log('✅  Chrome ready.');
  } catch (e) {
    console.error('❌  Could not download Chrome:', e.message);
    console.error('    Run manually: npx puppeteer browsers install chrome');
    rl.close(); process.exit(1);
  }

  // ── 5. Detect printers ────────────────────────────────────────────────────
  console.log('\n🖨️   Detecting system printers...');
  let printers = [];

  try {
    if (IS_WIN) {
      const out = run('powershell -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name | ConvertTo-Json -Compress"');
      const parsed = JSON.parse(out);
      printers = (Array.isArray(parsed) ? parsed : [parsed]).filter(Boolean);
    } else {
      const out = run("lpstat -p 2>/dev/null | awk '{print $2}'");
      printers = out.split('\n').filter(Boolean);
    }
  } catch {
    console.log('  ⚠️  Could not auto-detect printers. You will enter the name manually.');
  }

  let printerName = '';

  if (printers.length > 0) {
    // Suggest CK710 if found
    const ck710idx = printers.findIndex(p => p.toLowerCase().includes('ck710') || p.toLowerCase().includes('351002'));
    const defaultChoice = ck710idx >= 0 ? String(ck710idx + 1) : '1';

    console.log('\n  Available printers:');
    printers.forEach((p, i) => {
      const tag = (i === ck710idx) ? ' ← thermal (recommended)' : '';
      console.log(`    ${String(i + 1).padStart(2)}. ${p}${tag}`);
    });
    const choice = await ask(rl, '\n  Select number (or 0 to type manually)', defaultChoice);
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

  // ── 6. Set as Windows default printer ────────────────────────────────────
  if (IS_WIN) {
    try {
      run(`powershell -NoProfile -Command "(Get-WmiObject -Query \\"Select * From Win32_Printer Where Name='${printerName.replace(/'/g, "\\'")}'\\" ).SetDefaultPrinter()"`);
      console.log(`\n  ✅  "${printerName}" set as Windows default printer.`);
      console.log('      (Required for --kiosk-printing to target the right printer.)');
    } catch {
      console.log(`\n  ⚠️   Could not set default printer automatically.`);
      console.log(`      Please set "${printerName}" as default manually:`);
      console.log('      Settings → Bluetooth & devices → Printers & scanners → set default');
    }
  }

  // ── 7. Webapp URL ─────────────────────────────────────────────────────────
  const defaultUrl = 'https://mschools-vibecoding.vercel.app';
  const serverUrl  = await ask(rl, '\n  Webapp URL (production or local dev)', defaultUrl);

  // ── 8. Save config ────────────────────────────────────────────────────────
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
