#!/usr/bin/env python3
"""
Download team video recordings from Google Drive.

Usage:
  python scripts/download_from_drive.py
  npm run download          (from video/ directory)
  npm run render:full       (download + render in one step)

Dependencies: pip install gdown rich
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

# ── Dependency check ────────────────────────────────────────────────────────
try:
    import gdown
    from rich import box
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
except ImportError:
    print("Instala dependencias: pip install gdown rich")
    sys.exit(1)

# ── Path resolution (works from any working directory) ───────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
LINKS_FILE = REPO_ROOT / "drive-links.json"
VIDEOS_DIR = REPO_ROOT / "public" / "videos"
MIN_SIZE_BYTES = 1 * 1024 * 1024  # 1 MB

console = Console()

# ── Helpers ──────────────────────────────────────────────────────────────────

def video_path(persona_key: str) -> Path:
    return VIDEOS_DIR / f"{persona_key}.mp4"


def is_valid(path: Path) -> bool:
    """File exists and is larger than MIN_SIZE_BYTES."""
    return path.exists() and path.stat().st_size > MIN_SIZE_BYTES


def format_size(path: Path) -> str:
    if not path.exists():
        return "—"
    mb = path.stat().st_size / (1024 * 1024)
    return f"{mb:.1f} MB"


def get_duration(path: Path) -> str:
    """Return HH:MM duration via ffprobe, or '—' if unavailable."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        seconds = float(result.stdout.strip())
        m, s = divmod(int(seconds), 60)
        return f"{m}:{s:02d}"
    except Exception:
        return "—"


def load_links() -> dict:
    if not LINKS_FILE.exists():
        console.print("[bold red]No se encontró drive-links.json en video/[/bold red]")
        console.print(f"  Ruta esperada: {LINKS_FILE}")
        sys.exit(1)
    try:
        with open(LINKS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        console.print(f"[bold red]drive-links.json tiene JSON inválido:[/bold red] {exc}")
        sys.exit(1)


# ── Step 1: Read config ───────────────────────────────────────────────────────

def step1_load(data: dict) -> list[dict]:
    """Return a list of persona records with resolved paths."""
    personas = []
    for key, info in data.items():
        personas.append(
            {
                "key": key,
                "name": info.get("name", key),
                "scenes": info.get("scenes", "?"),
                "url": info.get("drive_url", "").strip(),
                "path": video_path(key),
            }
        )
    return personas


# ── Step 2: Status table ──────────────────────────────────────────────────────

def step2_status(personas: list[dict]) -> None:
    console.rule("[bold cyan]Estado inicial[/bold cyan]")

    table = Table(box=box.ROUNDED, show_header=True, header_style="bold cyan")
    table.add_column("Persona", style="bold white", no_wrap=True)
    table.add_column("Rol")
    table.add_column("Escenas", justify="center")
    table.add_column("Link", justify="center")
    table.add_column("Archivo", justify="center")

    link_ok = 0
    file_ok = 0

    for p in personas:
        has_link = bool(p["url"])
        has_file = is_valid(p["path"])

        if has_link:
            link_ok += 1
        if has_file:
            file_ok += 1

        # Extract short persona label
        label = p["key"].capitalize()  # "Persona1" → "persona1" → cap
        label = p["name"].split("—")[0].strip()  # "Persona 1"

        table.add_row(
            label,
            p["name"].split("—")[1].strip() if "—" in p["name"] else p["name"],
            p["scenes"],
            "✅" if has_link else "[red]❌[/red]",
            "✅ listo" if has_file else "[dim]❌ falta[/dim]",
        )

    console.print(table)
    console.print(
        f"  [green]✅ {link_ok} de 5 links listos[/green]  |  "
        f"[{'green' if file_ok == 5 else 'yellow'}]"
        f"{'✅' if file_ok == 5 else '⚠️ '} {file_ok} de 5 archivos descargados[/{'green' if file_ok == 5 else 'yellow'}]"
    )
    console.print()


# ── Step 3: Download loop ─────────────────────────────────────────────────────

def step3_download(personas: list[dict]) -> None:
    console.rule("[bold cyan]Descargando videos[/bold cyan]")
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    for p in personas:
        label = p["name"].split("—")[0].strip()

        if not p["url"]:
            console.print(f"  [yellow]⚠️  {label}: sin link — omitiendo[/yellow]")
            continue

        if is_valid(p["path"]):
            size = format_size(p["path"])
            console.print(f"  [dim]✓  {label}: ya descargado ({size}) — omitiendo[/dim]")
            continue

        console.print(f"\n  [cyan]⬇  Descargando {label}...[/cyan]")
        console.print(f"     → {p['path']}\n")

        try:
            result = gdown.download(
                url=p["url"],
                output=str(p["path"]),
                quiet=False,
                fuzzy=True,
            )

            if result is None or not is_valid(p["path"]):
                raise RuntimeError(
                    "El archivo no se descargó o está vacío. "
                    "Verifica que el link sea público."
                )

            size = format_size(p["path"])
            console.print(
                f"\n  [bold green]✅ {label} descargado correctamente ({size})[/bold green]"
            )

        except Exception as exc:
            console.print(
                f"\n  [bold red]❌ {label}: error al descargar[/bold red]"
            )
            console.print(
                f"     [dim]{exc}[/dim]"
            )
            console.print(
                "     [yellow]Revisa que el link sea público "
                "(\"Cualquier persona con el enlace puede ver\")[/yellow]"
            )

    console.print()


# ── Step 4: Final verification ────────────────────────────────────────────────

def step4_verify(personas: list[dict]) -> int:
    """Returns count of valid files."""
    console.rule("[bold cyan]Verificación final[/bold cyan]")

    table = Table(box=box.ROUNDED, show_header=True, header_style="bold cyan")
    table.add_column("Archivo", style="bold white", no_wrap=True)
    table.add_column("Estado", justify="center")
    table.add_column("Tamaño", justify="right")
    table.add_column("Duración", justify="center")

    valid_count = 0

    for p in personas:
        path = p["path"]
        ok = is_valid(path)

        if ok:
            valid_count += 1
            dur = get_duration(path)
            size = format_size(path)
            status = "[green]✅[/green]"
        else:
            dur = "—"
            size = "—"
            status = "[red]❌[/red]"

        table.add_row(path.name, status, size, dur)

    console.print(table)
    console.print()
    return valid_count


# ── Step 5: Render readiness ──────────────────────────────────────────────────

def step5_readiness(valid_count: int, total: int) -> None:
    if valid_count == total:
        console.print(
            Panel(
                "[bold green]✅ LISTO PARA RENDERIZAR[/bold green]\n"
                "[dim]Corre:[/dim] [cyan]cd video && npm run build[/cyan]",
                border_style="green",
                expand=False,
            )
        )
    else:
        missing = total - valid_count
        console.print(
            Panel(
                f"[bold yellow]⚠️  FALTAN {missing} VIDEO{'S' if missing > 1 else ''}[/bold yellow]\n"
                "[dim]El render usará placeholder para los archivos faltantes.[/dim]\n"
                "[dim]Corre igual con:[/dim] [cyan]npm run build[/cyan]",
                border_style="yellow",
                expand=False,
            )
        )


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    console.print()
    console.print(
        Panel(
            "[bold cyan]TPs_data — Descarga de videos desde Google Drive[/bold cyan]",
            border_style="cyan",
            expand=False,
        )
    )
    console.print()

    try:
        data = load_links()
        personas = step1_load(data)

        step2_status(personas)
        step3_download(personas)
        valid = step4_verify(personas)
        step5_readiness(valid, len(personas))

    except SystemExit:
        raise
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelado por el usuario.[/yellow]")
        sys.exit(0)
    except Exception as exc:
        console.print(f"\n[bold red]Error inesperado:[/bold red] {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
