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

"""Application configuration loaded from an INI file."""

from __future__ import annotations

import configparser
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ServerConfig:
    """Configuration of the HTTP server."""

    address: str
    port: int


@dataclass(frozen=True)
class MediRecConfig:
    """Configuration of MediRec data files."""

    workbook: Path
    reports: Path


@dataclass(frozen=True)
class AppConfig:
    """Complete MediRec configuration."""

    server: ServerConfig
    medirec: MediRecConfig
    ini_path: Path


class ConfigurationLoader:
    """Loads and validates MediRec configuration."""

    @staticmethod
    def load(path: Path) -> AppConfig:
        """Load configuration from *path*.

        :param path: Path to the INI configuration file.
        :returns: Validated application configuration.
        :raises ValueError: If a required setting is invalid.
        """
        parser = configparser.ConfigParser(interpolation=None)
        loaded = parser.read(path, encoding="utf-8")
        if not loaded:
            raise FileNotFoundError(f"Configuration file not found: {path}")
        address = parser.get("server", "address", fallback="127.0.0.1")
        port = parser.getint("server", "port", fallback=8080)
        workbook = Path(parser.get("medirec", "workbook"))
        reports = Path(parser.get("medirec", "reports"))
        if port < 1 or port > 65535:
            raise ValueError("Server port must be between 1 and 65535.")
        workbook = workbook.expanduser().resolve()
        reports = reports.expanduser().resolve()
        server = ServerConfig(address=address, port=port)
        medirec = MediRecConfig(workbook=workbook, reports=reports)
        reti = AppConfig(server=server, medirec=medirec, ini_path=path.expanduser().resolve())
        return reti
