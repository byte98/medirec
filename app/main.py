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
from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
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
    languages = LanguageService(LANGUAGE_DIRECTORY, config.server.root_path)
    reports = ReportService(storage, languages, config.medirec.reports, APP_VERSION, STATIC_DIRECTORY)
    api = MediRecAPI(storage, languages, reports)
    application_root_path = "" if config.server.root_path == "/" else config.server.root_path
    application = FastAPI(
        title="MediRec",
        version=APP_VERSION,
        root_path=application_root_path,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    root_path = config.server.root_path.rstrip("/")
    application.mount("/static", StaticFiles(directory=STATIC_DIRECTORY), name="static")
    if root_path:
        application.mount(f"{root_path}/static", StaticFiles(directory=STATIC_DIRECTORY), name="static-prefixed")
    application.include_router(api.router)
    if root_path:
        application.include_router(api.router, prefix=root_path)

    @application.get("/", include_in_schema=False)
    async def index() -> HTMLResponse:
        """Serve the main MediRec page."""
        asset_prefix = f"{root_path}/" if root_path else "/"
        content = (STATIC_DIRECTORY / "html" / "home.html").read_text(encoding="utf-8")
        content = content.replace('href="static/', 'href="__ASSET_PREFIX__static/')
        content = content.replace('src="static/', 'src="__ASSET_PREFIX__static/')
        content = content.replace("__ROOT_PATH__", root_path)
        content = content.replace("__ASSET_PREFIX__", asset_prefix)
        reti = HTMLResponse(content=content)
        return reti

    if root_path:
        application.add_api_route(f"{root_path}/", index, methods=["GET"], include_in_schema=False)

    @application.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> FileResponse:
        """Serve the application icon."""
        reti = FileResponse(STATIC_DIRECTORY / "favicon.ico")
        return reti

    if root_path:
        application.add_api_route(f"{root_path}/favicon.ico", favicon, methods=["GET"], include_in_schema=False)

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
