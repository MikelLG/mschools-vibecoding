#!/usr/bin/env python3
"""
Vibe Coding — ESC/POS ticket printer
Reads JSON from stdin, prints via Win32Raw (bypasses COM port driver).
Called from print-server.mjs.

stdin JSON fields:
  printerName  - Windows printer name
  pairName     - group name
  tasca        - prompt / task description
  appUrl       - URL to the generated app
"""
import sys
import json
from datetime import datetime


def wrap_text(text: str, width: int) -> list[str]:
    words = text.split()
    lines, line = [], ""
    for w in words:
        if len(line) + len(w) + (1 if line else 0) > width:
            if line:
                lines.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        lines.append(line)
    return lines


def main():
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
    except Exception as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    printer_name = data.get("printerName", "")
    pair_name    = (data.get("pairName") or "").strip() or "Grup"
    tasca        = (data.get("tasca") or "").strip()
    app_url      = (data.get("appUrl") or "").strip()

    if not printer_name:
        print("No printerName provided", file=sys.stderr)
        sys.exit(1)

    try:
        from escpos.printer import Win32Raw
    except ImportError:
        print("python-escpos not installed. Run: pip install python-escpos pywin32", file=sys.stderr)
        sys.exit(2)

    try:
        p = Win32Raw(printer_name)
        p.open(job_name="mSchools-Ticket")
    except Exception as e:
        print(f"Cannot open printer '{printer_name}': {e}", file=sys.stderr)
        sys.exit(1)

    try:
        SEP = "-" * 32

        # ── Header ───────────────────────────────────────────────
        p.set(align="center", bold=True, width=2, height=2)
        p.text("mSchools\n")
        p.set(align="center", bold=False, width=1, height=1)
        p.text("IA Lab \xb7 Vibe Coding 2026\n")
        p.text(SEP + "\n\n")

        # ── Group name (big) ──────────────────────────────────────
        p.set(align="center", bold=True, width=2, height=2)
        p.text(pair_name[:24] + "\n\n")

        # ── Task description ──────────────────────────────────────
        if tasca:
            p.set(align="left", bold=False, width=1, height=1)
            for ln in wrap_text(tasca[:140], 32):
                p.text(ln + "\n")
            p.text("\n")

        # ── QR code ───────────────────────────────────────────────
        if app_url:
            p.set(align="center")
            p.qr(app_url, size=7, model=2, native=True)
            p.text("\n")

        # ── Footer ────────────────────────────────────────────────
        p.set(align="center", bold=False, width=1, height=1)
        p.text(datetime.now().strftime("%d/%m/%Y %H:%M") + "\n")
        p.text(SEP + "\n")
        p.text("\n\n\n")

        p.cut()

    except Exception as e:
        print(f"Print error: {e}", file=sys.stderr)
        try:
            p.close()
        except Exception:
            pass
        sys.exit(1)

    try:
        p.close()
    except Exception:
        pass


if __name__ == "__main__":
    main()
