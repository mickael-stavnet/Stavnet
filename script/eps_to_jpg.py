from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import EpsImagePlugin, Image
except ImportError as exc:
    raise SystemExit(
        "Pillow n'est pas installe. Lance d'abord: pip install Pillow"
    ) from exc


def find_ghostscript() -> str | None:
    candidates = [
        os.environ.get("GHOSTSCRIPT_EXE"),
        r"C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.04.0\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.03.1\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.02.1\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.01.2\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.00.0\bin\gswin64c.exe",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return candidate
    return None


def convert_eps_to_jpg(folder: Path, quality: int, dpi: int) -> int:
    ghostscript_path = find_ghostscript()
    if ghostscript_path is None:
        raise SystemExit(
            "Ghostscript introuvable. Installe Ghostscript ou define GHOSTSCRIPT_EXE."
        )

    EpsImagePlugin.gs_windows_binary = ghostscript_path

    eps_files = sorted(folder.glob("*.eps"))
    if not eps_files:
        print(f"Aucun fichier .eps trouve dans: {folder}")
        return 0

    converted = 0
    for eps_file in eps_files:
        jpg_file = eps_file.with_suffix(".jpg")
        with Image.open(eps_file) as image:
            image.load(scale=max(1, dpi // 72))
            rgb_image = image.convert("RGB")
            rgb_image.save(jpg_file, "JPEG", quality=quality, optimize=True)
        converted += 1
        print(f"Converti: {eps_file.name} -> {jpg_file.name}")

    return converted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convertit tous les fichiers .eps d'un dossier en .jpg dans ce meme dossier."
    )
    parser.add_argument("folder", help="Chemin du dossier contenant les fichiers .eps")
    parser.add_argument("--quality", type=int, default=95, help="Qualite JPEG, par defaut 95")
    parser.add_argument("--dpi", type=int, default=300, help="DPI cible, par defaut 300")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    folder = Path(args.folder).expanduser().resolve()

    if not folder.exists() or not folder.is_dir():
        raise SystemExit(f"Dossier invalide: {folder}")

    converted = convert_eps_to_jpg(folder, quality=args.quality, dpi=args.dpi)
    print(f"Total converti: {converted}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
