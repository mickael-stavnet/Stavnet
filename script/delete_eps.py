from __future__ import annotations

import argparse
import sys
from pathlib import Path


def delete_eps_files(folder: Path) -> int:
    eps_files = sorted(folder.glob("*.eps"))
    if not eps_files:
        print(f"Aucun fichier .eps trouve dans: {folder}")
        return 0

    deleted = 0
    for eps_file in eps_files:
        eps_file.unlink()
        deleted += 1
        print(f"Supprime: {eps_file.name}")

    return deleted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Supprime tous les fichiers .eps d'un dossier."
    )
    parser.add_argument("folder", help="Chemin du dossier contenant les fichiers .eps")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    folder = Path(args.folder).expanduser().resolve()

    if not folder.exists() or not folder.is_dir():
        raise SystemExit(f"Dossier invalide: {folder}")

    deleted = delete_eps_files(folder)
    print(f"Total supprime: {deleted}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
