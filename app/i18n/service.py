# MediRec - simple web application to save some basic medical records.
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

"""Language metadata and translation loading."""

from __future__ import annotations

import json
from pathlib import Path


class LanguageService:
    """Loads versioned language resources shipped with the application."""

    def __init__(self, directory: Path):
        """Create language service.

        :param directory: Directory containing language JSON files.
        """
        self._directory = directory

    def metadata(self) -> list[dict]:
        """Return metadata for every available language."""
        metadata = []
        for path in sorted(self._directory.glob("*.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            metadata.append({key: data[key] for key in ("code", "name", "nativeName", "version", "flag")})
        reti = metadata
        return reti

    def get(self, code: str) -> dict:
        """Return one language resource.

        :param code: ISO language code.
        :returns: Complete language resource.
        :raises KeyError: If the language does not exist.
        """
        path = self._directory / f"{code}.json"
        if not path.is_file():
            raise KeyError(code)
        reti = json.loads(path.read_text(encoding="utf-8"))
        return reti
