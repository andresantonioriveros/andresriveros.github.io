#!/usr/bin/env python3

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


DISPLAY_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def object_exists(bucket: str, object_key: str) -> bool:
    command = [
        "wrangler",
        "r2",
        "object",
        "get",
        f"{bucket}/{object_key}",
        "--remote",
        "--file",
        "/tmp/opencode-r2-exists-check",
    ]
    result = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return result.returncode == 0
def main() -> int:
    parser = argparse.ArgumentParser(
        description="Batch upload local gallery assets to an R2 bucket."
    )
    parser.add_argument(
        "bucket",
        help="R2 bucket name, for example: andresriveros-images",
    )
    parser.add_argument(
        "--source",
        default="assets/images/photos",
        help="Directory containing local image assets",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print upload commands without executing them",
    )
    args = parser.parse_args()

    source_dir = Path(args.source)
    if not source_dir.exists():
        print(f"Source directory not found: {source_dir}", file=sys.stderr)
        return 1

    files = sorted(
        path for path in source_dir.iterdir() if path.suffix.lower() in DISPLAY_EXTENSIONS
    )
    if not files:
        print("No supported image files found.", file=sys.stderr)
        return 1

    print("Upload plan:\n")
    for path in files:
        object_key = f"photos/{path.name}"
        public_url = f"https://images.andresriveros.com/{object_key}"
        command = [
            "wrangler",
            "r2",
            "object",
            "put",
            f"{args.bucket}/{object_key}",
            "--file",
            str(path),
            "--remote",
        ]

        print(f"{path.name} -> {object_key}")
        print(f"  {public_url}")

        if args.dry_run:
            print(f"  dry-run: {' '.join(command)}\n")
            continue

        if object_exists(args.bucket, object_key):
            print("  skipped: already exists remotely\n")
            continue

        try:
            subprocess.run(command, check=True)
        except FileNotFoundError:
            print("\n`wrangler` is not installed or not on PATH.", file=sys.stderr)
            return 1
        except subprocess.CalledProcessError as exc:
            print(f"\nUpload failed for {path.name}: {exc}", file=sys.stderr)
            return exc.returncode

        print()

    print("Done.")
    print("\nNext: update `web/_data/photos.yml` to use the printed URLs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
