"""Fail when a tracked file has not been explicitly approved for public Git."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "PUBLIC_FILES.txt"
PRIVATE_DIRECTORIES = {"ops", "_ops", "internal", "_internal", "private", "_private", "private-community-ops"}
PRIVATE_NAME_FRAGMENTS = (
    "community-operations",
    "community_operations",
    "operations-dashboard",
    "operations_dashboard",
)
PRIVATE_BASENAMES = {".env", "id_rsa", "id_ed25519"}
PRIVATE_SUFFIXES = {".key", ".pem", ".p12", ".pfx", ".sqlite", ".sqlite3"}


def tracked_files() -> set[str]:
    result = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", "--cached", "-z"],
        check=True,
        capture_output=True,
    )
    return {
        item.decode("utf-8", errors="surrogateescape")
        for item in result.stdout.split(b"\0")
        if item
    }


def approved_files() -> tuple[set[str], list[str]]:
    lines = MANIFEST.read_text(encoding="utf-8").splitlines()
    entries = [line.strip() for line in lines if line.strip() and not line.startswith("#")]
    errors: list[str] = []
    if len(entries) != len(set(entries)):
        errors.append("PUBLIC_FILES.txt contains duplicate paths")
    if entries != sorted(entries):
        errors.append("PUBLIC_FILES.txt paths must be sorted")
    if any("\\" in path or path.startswith("/") or "/../" in f"/{path}/" for path in entries):
        errors.append("PUBLIC_FILES.txt contains a non-repository-relative path")
    return set(entries), errors


def private_path(path: str) -> bool:
    parts = path.lower().split("/")
    basename = parts[-1]
    return (
        any(part in PRIVATE_DIRECTORIES for part in parts[:-1])
        or any(fragment in part for part in parts for fragment in PRIVATE_NAME_FRAGMENTS)
        or basename in PRIVATE_BASENAMES
        or basename.startswith(".env.")
        or Path(basename).suffix in PRIVATE_SUFFIXES
    )


def validate(tracked: set[str], approved: set[str]) -> list[str]:
    errors: list[str] = []
    for path in sorted(tracked - approved):
        errors.append(f"Unapproved public file: {path}")
    for path in sorted(approved - tracked):
        errors.append(f"Manifest path is not tracked: {path}")
    for path in sorted(tracked | approved):
        if private_path(path):
            errors.append(f"Internal or sensitive path cannot be public: {path}")
    return errors


def main() -> int:
    approved, errors = approved_files()
    tracked = tracked_files()
    errors.extend(validate(tracked, approved))
    if errors:
        print("Publication boundary check failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        print("Keep private files outside this repository. List only reviewed public files in PUBLIC_FILES.txt.", file=sys.stderr)
        return 1
    print(f"Publication boundary check passed: {len(tracked)} explicitly approved public files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
