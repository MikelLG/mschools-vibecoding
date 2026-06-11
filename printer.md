# Vibe Coding — Servidor d'impressió local

Permet imprimir els tiquets automàticament i en silenci des de la pantalla del facilitador, sense finestres emergents ni diàlegs de confirmació.

---

## Com funciona

Quan el servidor d'impressió està en marxa:
- La pàgina `/screen` detecta el servidor i mostra **"● Servidor actiu"** en verd.
- Cada tiquet nou s'imprimeix automàticament sense cap clic.
- Si el servidor **no** està en marxa, la pàgina torna al mode manual (finestres emergents) i mostra **"○ Mode manual"** en taronja.

---

## Requisits previs

- **Node.js 18 o superior** — [descarregar a nodejs.org](https://nodejs.org)
- El repositori del projecte clonat (`git clone ...`)
- El fitxer **`.env.local`** al directori arrel del projecte — el servidor d'impressió només necessita les 6 variables de Firebase (no cal la clau de Gemini):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Demana aquests valors al responsable tècnic del projecte.

---

## Primer cop (instal·lació)

Fer això **una sola vegada** per ordinador:

```bash
npm run setup-print
```

El script farà automàticament:
1. Comprova que Node.js ≥ 18 està instal·lat
2. Instal·la **Puppeteer** (Chromium sense capçalera, ~150 MB) i **pdf-to-printer**
3. Llista les impressores disponibles al sistema
4. Demana que seleccionis la impressora (introdueix el número)
5. Demana la URL de la webapp (per defecte: `https://mschools-vibecoding.vercel.app`)
6. Desa la configuració a `scripts/print-server.config.json`

> **Nota:** La instal·lació de Puppeteer pot trigar uns minuts la primera vegada perquè descarrega Chromium.

---

## Cada dia de taller

Obre un terminal al directori del projecte i executa:

```bash
npm run print-server
```

Hauries de veure:

```
🖨️   Vibe Coding — Print Server
──────────────────────────────────────────────────────
  Printer  : CK710 (o el nom de la teva impressora)
  Webapp   : https://mschools-vibecoding.vercel.app
  Health   : http://localhost:3131/health
──────────────────────────────────────────────────────

  Listening for tickets... (Ctrl+C to stop)
```

Després obre `/screen` al navegador — el badge verd confirma que tot funciona.

Per aturar el servidor: **Ctrl + C** al terminal.

---

## Canviar la impressora o la URL

Torna a executar el setup:

```bash
npm run setup-print
```

Detectarà que els paquets ja estan instal·lats i anirà directament a la selecció d'impressora.

---

## Solució de problemes

| Problema | Solució |
|----------|---------|
| `❌ .env.local not found` | Copia el fitxer `.env.local` al directori arrel del projecte |
| `❌ Config missing` | Executa `npm run setup-print` primer |
| Badge taronja "Mode manual" a `/screen` | El servidor no està en marxa — executa `npm run print-server` |
| El tiquet queda en estat "Error" | Comprova que la impressora estigui encesa i sigui la predeterminada al sistema |
| La impressora no apareix a la llista | Instal·la el driver de la impressora i torna a executar el setup |
| Port 3131 en ús | Tanca l'altra instància del servidor (o reinicia el terminal) |

---

## Estructura de fitxers

```
scripts/
  setup-print-server.mjs     ← script d'instal·lació (un sol cop)
  print-server.mjs           ← servidor d'impressió (cada taller)
  print-server.config.json   ← configuració local (no es puja al repositori)
```
