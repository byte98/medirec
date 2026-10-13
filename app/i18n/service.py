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

    def __init__(self, directory: Path, root_path: str = "/"):
        """Create language service.

        :param directory: Directory containing language JSON files.
        :param root_path: External URL prefix used by the application.
        """
        self._directory = directory
        self._root_path = root_path.rstrip("/")

    def metadata(self) -> list[dict]:
        """Return metadata for every available language."""
        metadata = []
        for path in sorted(self._directory.glob("*.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            item = {key: data[key] for key in ("code", "name", "nativeName", "version", "flag")}
            item["flag"] = self._prefix_static_path(item["flag"])
            metadata.append(item)
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
        reti["flag"] = self._prefix_static_path(reti["flag"])
        return reti

    def _prefix_static_path(self, path: str) -> str:
        """Prefix a language asset path with the configured application path."""
        return f"{self._root_path}/{path.lstrip('/')}" if self._root_path else f"/{path.lstrip('/')}"
