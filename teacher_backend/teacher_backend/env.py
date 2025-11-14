"""Minimal .env loader so dev secrets live outside git."""
from __future__ import annotations

import os
from pathlib import Path


def load_env_file(path: str | Path | None = None) -> None:
    """Populate os.environ with key=value pairs from a .env file."""
    candidates: list[Path] = []
    if path:
        candidates.append(Path(path))
    else:
        root = Path(__file__).resolve().parent
        candidates.extend(
            [
                root / ".env",
                root.parent / ".env",
            ]
        )

    env_path = next((candidate for candidate in candidates if candidate.exists()), None)
    if env_path is None:
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


__all__ = ["load_env_file"]
