# Impressora tèrmica — Vibe Coding mSchools 2026

Guia per configurar la impressió automàtica de tiquets en qualsevol ordinador facilitador.

## Maquinari

| Element | Model |
|---|---|
| Impressora | **Equip model 351002** (thermal receipt, USB) |
| Driver Windows | CK710 — inclòs a `scripts/351002_Drivers.zip` |
| Connexió | USB directe (no cal xarxa ni COM port) |

---

## Configuració inicial (primera vegada)

### 1. Instal·lar Git i Node.js

Obre PowerShell com a **Administrador** i executa:

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
```

Tanca i torna a obrir el terminal. Verifica:

```
git --version
node --version
npm --version
```

### 2. Obtenir el codi

```
git clone https://github.com/MikelLG/mschools-vibecoding.git
cd mschools-vibecoding
npm install
```

> `npm install` descarrega Puppeteer però no sempre baixa Chrome automàticament. Si veus un error "Could not find Chrome", executa:
> ```
> npx puppeteer browsers install chrome
> ```

### 3. Copiar el fitxer d'entorn

Copia el fitxer `.env.local` de l'ordinador principal (conté les claus de Firebase i Gemini) i enganxa'l a l'arrel del projecte:

```
mschools-vibecoding/
  .env.local   ← aquí
```

> No es puja al repositori. Demana'l al responsable del projecte via USB o missatge privat.

### 4. Instal·lar el driver de la impressora

La impressora Equip 351002 és una impressora **USB nativa** — NO usa port COM ni port sèrie.
Si Windows detecta un error "This is not Prolific" o demana un port COM, **ignora'l**: és el
driver PL2303 d'un xip USB-sèrie no relacionat que pot estar al mateix ordinador.

**Instal·lació correcta:**

1. Connecta la impressora per USB i encén-la
2. Extreu `scripts/351002_Drivers.zip`
3. Obre el Gestor de dispositius (`devmgmt.msc`)
4. Cerca la impressora sota **"Cues d'impressió"** o **"Altres dispositius"**
5. Fes clic dret → **"Actualitzar controlador"** → **"Cercar en el meu ordinador"**
6. Apunta a la carpeta extreta del ZIP → **"Acceptar"**
7. Windows instal·larà el driver i la impressora apareixerà com **"CK710 Printer"**

**Alternativa (línia de comandes, com a Administrador):**

```powershell
pnputil /add-driver "C:\ruta\al\driver.inf" /install
```

8. Un cop instal·lada, estableix-la com a **impressora predeterminada**:
   Configuració → Bluetooth i dispositius → Impressores → establir per defecte

### 5. Executar el script de configuració

```
node scripts/setup-print-server.mjs
```

El script fa tot automàticament:
- Detecta si el driver CK710 està instal·lat (i obre el ZIP si no)
- Llista les impressores i ressalta la CK710
- L'estableix com a impressora predeterminada de Windows
- Guarda la configuració a `scripts/print-server.config.json`

---

## Cada dia de taller

```
npm run print-server
```

Mantén el terminal obert. Quan vegis `Listening for tickets...`, obre `/screen` — hauries de veure la badge verda **"● Servidor actiu · CK710 Printer (2)"**.

Els tiquets s'imprimiran automàticament quan els participants facin clic a **"Finalitza i comparteix"**.

---

## Com funciona

1. Participant envia tiquet des de `/ticket/[id]` → entra a Firestore `printQueue`
2. El servidor detecta l'entrada nova
3. Puppeteer obre `/print/[queueId]` en Chrome (minimitzat, fora de pantalla)
4. Chrome imprimeix en silenci amb `--kiosk-printing` (sense diàleg)
5. Estat: `pending` → `printing` → `printed`

---

## Solució de problemes

| Problema | Solució |
|---|---|
| Badge "○ Mode manual" a /screen | El servidor no està corrent — executa `npm run print-server` |
| "This is not Prolific" / error COM | Ignora'l — és un driver no relacionat. Instal·la el CK710 per USB com s'indica a dalt |
| Error "Cannot open printer" | Verifica el nom exacte a Configuració → Impressores i actualitza `scripts/print-server.config.json` |
| Impressió no surt | Verifica que la CK710 és la impressora predeterminada de Windows |
| Items encallats en "Imprimint..." | Selecciona'ls a /screen → "↺ Reintentar" |
| Finestra de Chrome apareix | Normal — s'obre fora de pantalla i es tanca sola al cap de 5 s |

---

## Fitxers rellevants

```
scripts/
  print-server.mjs          ← servidor principal (Firestore → Puppeteer → impressora)
  setup-print-server.mjs    ← configuració inicial (executar una vegada)
  print-server.config.json  ← configuració local (gitignored)
  351002_Drivers.zip        ← driver Windows per a Equip 351002 / CK710
app/
  print/[queueId]/page.tsx  ← pàgina del tiquet tèrmic (renderitzada per Puppeteer)
  screen/page.tsx           ← pantalla facilitador (cua d'impressió + estat)
```
