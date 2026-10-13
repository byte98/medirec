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

"""MediRec FastAPI application entry point."""

from __future__ import annotations

import argparse
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .api.router import MediRecAPI
from .config.configuration import ConfigurationLoader
from .i18n.service import LanguageService
from .storage.excel import WorkbookStorage
from .reporting.service import ReportService

APP_VERSION = "2.2.2"
BASE_DIRECTORY = Path(__file__).resolve().parent
STATIC_DIRECTORY = BASE_DIRECTORY / "static"
LANGUAGE_DIRECTORY = STATIC_DIRECTORY / "languages"


def create_application(ini_path: Path) -> FastAPI:
    """Create a configured FastAPI application.

    :param ini_path: Path to the INI file.
    :returns: Configured FastAPI application.
    """
    config = ConfigurationLoader.load(ini_path)
    config.medirec.reports.mkdir(parents=True, exist_ok=True)
    storage = WorkbookStorage(config.medirec.workbook)
    storage.initialize()
    languages = LanguageService(LANGUAGE_DIRECTORY)
    reports = ReportService(storage, languages, config.medirec.reports, APP_VERSION, STATIC_DIRECTORY)
    api = MediRecAPI(storage, languages, reports)
    application = FastAPI(
        title="MediRec",
        version=APP_VERSION,
        root_path=config.server.root_path,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    configured_root_path = config.server.root_path

    @application.middleware("http")
    async def remove_external_root_path(request: Request, call_next):
        """Accept requests with or without the reverse-proxy prefix."""
        path = request.scope["path"]
        if configured_root_path != "/" and (
            path == configured_root_path or path.startswith(f"{configured_root_path}/")
        ):
            stripped_path = path[len(configured_root_path):] or "/"
            request.scope["path"] = stripped_path
            request.scope["raw_path"] = stripped_path.encode("ascii")
        response = await call_next(request)
        return response

    application.mount("/static", StaticFiles(directory=STATIC_DIRECTORY), name="static")
    application.include_router(api.router)

    @application.get("/", include_in_schema=False)
    async def index() -> FileResponse:
        """Serve the main MediRec page."""
        reti = FileResponse(STATIC_DIRECTORY / "html" / "home.html")
        return reti

    @application.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> FileResponse:
        """Serve the application icon."""
        reti = FileResponse(STATIC_DIRECTORY / "favicon.ico")
        return reti

    application.state.config = config
    application.state.storage = storage
    reti = application
    return reti


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="MediRec medical records server")
    parser.add_argument("--ini", required=True, type=Path, help="Path to the MediRec INI configuration file")
    reti = parser.parse_args()
    return reti


def main() -> None:
    """Start the MediRec HTTP server."""
    arguments = parse_arguments()
    config = ConfigurationLoader.load(arguments.ini)
    uvicorn.run(create_application(arguments.ini), host=config.server.address, port=config.server.port, access_log=True)


if __name__ == "__main__":
    main()
