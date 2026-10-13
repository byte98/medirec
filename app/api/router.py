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

"""FastAPI routes for MediRec."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, Response

from ..models.data import ClientCreate, HealthInsuranceCompany, HealthMeasurementCreate
from ..storage.excel import WorkbookStorage
from ..i18n.service import LanguageService
from ..models.report import ReportOptions
from ..reporting.service import ReportService


class MediRecAPI:
    """Builds the application's API router."""

    def __init__(self, storage: WorkbookStorage, languages: LanguageService, reports: ReportService):
        """Create API facade.

        :param storage: XLSX repository.
        :param languages: Language service.
        """
        self.storage = storage
        self.languages = languages
        self.reports = reports
        self.router = APIRouter(prefix="/api")
        self._register_routes()

    def _register_routes(self) -> None:
        """Register all API endpoints."""
        self.router.add_api_route("/languages", self.languages_metadata, methods=["GET"])
        self.router.add_api_route("/languages/{code}", self.language, methods=["GET"])
        self.router.add_api_route("/health-insurance-companies", self.health_insurance_companies, methods=["GET"])
        self.router.add_api_route("/health-insurance-companies", self.create_health_insurance_company, methods=["POST"])
        self.router.add_api_route("/clients", self.clients, methods=["GET"])
        self.router.add_api_route("/clients", self.create_client, methods=["POST"])
        self.router.add_api_route("/clients/{identifier}", self.client, methods=["GET"])
        self.router.add_api_route("/clients/{identifier}", self.delete_client, methods=["DELETE"])
        self.router.add_api_route("/clients/{identifier}/measurements", self.add_measurement, methods=["POST"])
        self.router.add_api_route("/clients/{identifier}/reports/preview", self.report_preview, methods=["POST"])
        self.router.add_api_route("/clients/{identifier}/reports", self.create_report, methods=["POST"])
        self.router.add_api_route("/clients/{identifier}/reports", self.list_reports, methods=["GET"])
        self.router.add_api_route("/clients/{identifier}/reports/{filename}", self.download_report, methods=["GET"])

    def languages_metadata(self) -> list[dict]:
        """Return language versions."""
        reti = self.languages.metadata()
        return reti

    def language(self, code: str) -> dict:
        """Return one language resource."""
        try:
            reti = self.languages.get(code)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Language not found.") from error
        return reti

    def health_insurance_companies(self) -> list[HealthInsuranceCompany]:
        """Return health insurance companies."""
        reti = self.storage.list_health_insurance_companies()
        return reti

    def create_health_insurance_company(self, company: HealthInsuranceCompany) -> HealthInsuranceCompany:
        """Create a health insurance company."""
        try:
            self.storage.add_health_insurance_company(company)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        reti = company
        return reti

    def clients(self) -> list:
        """Return all clients."""
        reti = self.storage.list_clients()
        return reti

    def create_client(self, client: ClientCreate):
        """Create a client."""
        try:
            reti = self.storage.create_client(client)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        return reti

    def client(self, identifier: str):
        """Return a client with health measurements."""
        try:
            reti = self.storage.get_client(identifier)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Client not found.") from error
        return reti

    def delete_client(self, identifier: str) -> dict[str, bool]:
        """Delete a client."""
        try:
            self.storage.delete_client(identifier)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Client not found.") from error
        reti = {"deleted": True}
        return reti

    def add_measurement(self, identifier: str, measurement: HealthMeasurementCreate):
        """Add a health measurement."""
        try:
            reti = self.storage.add_measurement(identifier, measurement)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Client not found.") from error
        return reti


    def report_preview(self, identifier: str, options: ReportOptions) -> HTMLResponse:
        """Return report HTML for the preview pane."""
        try:
            content = self.reports.preview(identifier, options)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Client not found.") from error
        reti = HTMLResponse(content=content)
        return reti

    def create_report(self, identifier: str, options: ReportOptions) -> Response:
        """Create and save a PDF report."""
        try:
            content, filename = self.reports.create(identifier, options)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Client not found.") from error
        reti = Response(content=content, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"', "X-Report-Filename": filename})
        return reti

    def list_reports(self, identifier: str) -> list[dict[str, str]]:
        """Return all reports saved for a client."""
        try:
            self.storage.get_client(identifier)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Client not found.") from error
        reti = self.reports.list_reports(identifier)
        return reti

    def download_report(self, identifier: str, filename: str) -> FileResponse:
        """Download one previously generated report."""
        try:
            path = self.reports.report_path(identifier, filename)
        except FileNotFoundError as error:
            raise HTTPException(status_code=404, detail="Report not found.") from error
        reti = FileResponse(path, media_type="application/pdf", filename=path.name)
        return reti
