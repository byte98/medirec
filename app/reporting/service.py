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

"""HTML and PDF medical-report generation."""

from __future__ import annotations

import html
from datetime import datetime
from pathlib import Path

from weasyprint import HTML

from ..models.data import HealthMeasurement, HealthStatus
from ..i18n.service import LanguageService
from ..models.data import HealthMeasurement
from ..models.report import ReportOptions
from ..storage.excel import WorkbookStorage


class ReportService:
    """Create, preview and store PDF medical reports."""

    COLUMNS = {
        "date": ("date", "Date", ""),
        "time": ("time", "Time", ""),
        "systolic": ("systolic", "Systolic pressure", "mmHg"),
        "diastolic": ("diastolic", "Diastolic pressure", "mmHg"),
        "pulse": ("pulse", "Pulse", "min⁻¹"),
        "oxygen_saturation": ("oxygen", "O₂ saturation", "%"),
        "height": ("height", "Height", "cm"),
        "weight": ("weight", "Weight", "kg"),
        "bmi": ("bmi", "BMI", "kg×m⁻²"),
        "notes": ("notes", "Notes", ""),
    }

    INDICATOR_COLUMNS = {
        "systolic",
        "diastolic",
        "pulse",
        "oxygen_saturation",
        "weight",
        "bmi",
    }

    def __init__(
        self,
        storage: WorkbookStorage,
        languages: LanguageService,
        directory: Path,
        application_version: str,
        static_directory: Path,
    ):
        """Create a report service.

        :param storage: Workbook storage.
        :param languages: Application language service.
        :param directory: Directory where generated reports are stored.
        :param application_version: Current MediRec version.
        :param static_directory: Directory containing report fonts.
        """
        self._storage = storage
        self._languages = languages
        self._directory = directory
        self._application_version = application_version
        self._static_directory = static_directory

    def preview(self, identifier: str, options: ReportOptions) -> str:
        """Render a complete report as HTML.

        :param identifier: Selected client identifier.
        :param options: Report options.
        :returns: Complete report HTML.
        """
        client = self._storage.get_client(identifier)
        phrases = self._languages.get(options.language)["phrases"]
        measurements = self._filter(client.measurements, options)
        first_page_rows = self._rows_per_page(options, first_page=True)
        later_page_rows = self._rows_per_page(options, first_page=False)
        chunks = []
        if measurements:
            chunks.append(measurements[:first_page_rows])
            for index in range(first_page_rows, len(measurements), later_page_rows):
                chunks.append(measurements[index:index + later_page_rows])
        if not chunks:
            chunks = [[]]

        pages = len(chunks)
        first_date = options.date_from or (measurements[0].date if measurements else None)
        last_date = options.date_to or (measurements[-1].date if measurements else None)
        generated_time = self._date_time_text(datetime.now(), options.language)
        page_html = []
        start = 1
        for page, rows in enumerate(chunks, 1):
            end = min(start + len(rows) - 1, len(measurements))
            page_html.append(
                self._page(
                    client,
                    rows,
                    page,
                    pages,
                    len(measurements),
                    start,
                    end,
                    options,
                    phrases,
                    first_date,
                    last_date,
                    generated_time,
                )
            )
            start += len(rows)

        title = phrases.get("medical_data_report", "Medical data report")
        reti = (
            "<!DOCTYPE html>"
            f'<html lang="{html.escape(options.language)}">'
            "<head>"
            '<meta charset="UTF-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            f"<title>{html.escape(title)}</title>"
            f'<link type="text/css" rel="stylesheet" href="file://{self._static_directory / "fonts" / "selawik.css"}">'
            f'<link type="text/css" rel="stylesheet" href="file://{self._static_directory / "fonts" / "ubuntumono.css"}">'
            f"<style>{self._css(options)}</style>"
            "</head>"
            f'<body>{"".join(page_html)}</body>'
            "</html>"
        )
        return reti

    def create(self, identifier: str, options: ReportOptions) -> tuple[bytes, str]:
        """Create and save a PDF report.

        :param identifier: Selected client identifier.
        :param options: Report options.
        :returns: Generated PDF bytes and filename.
        """
        directory = self._directory / identifier
        directory.mkdir(parents=True, exist_ok=True)
        filename = datetime.now().strftime("%Y%m%d-%H%M%S-%f.pdf")
        path = directory / filename
        HTML(string=self.preview(identifier, options), base_url=str(self._static_directory.parent)).write_pdf(path)
        reti = (path.read_bytes(), filename)
        return reti

    def list_reports(self, identifier: str) -> list[dict[str, str]]:
        """List all reports generated for a client.

        :param identifier: Selected client identifier.
        :returns: Report filenames and creation times.
        """
        directory = self._directory / identifier
        reports = []
        if directory.is_dir():
            for path in sorted(directory.glob("*.pdf"), reverse=True):
                reports.append(
                    {
                        "name": path.name,
                        "created": datetime.fromtimestamp(path.stat().st_mtime).isoformat(timespec="seconds"),
                    }
                )
        reti = reports
        return reti

    def report_path(self, identifier: str, filename: str) -> Path:
        """Return a validated saved-report path.

        :param identifier: Selected client identifier.
        :param filename: Requested report filename.
        :returns: Existing report path.
        :raises FileNotFoundError: If the report does not exist.
        """
        candidate = Path(filename)
        directory = (self._directory / identifier).resolve()
        path = (directory / candidate.name).resolve()
        if (
            candidate.name != filename
            or candidate.suffix.lower() != ".pdf"
            or path.parent != directory
            or not path.is_file()
        ):
            raise FileNotFoundError(filename)
        reti = path
        return reti

    @staticmethod
    def _filter(measurements: list[HealthMeasurement], options: ReportOptions) -> list[HealthMeasurement]:
        """Filter measurements according to the selected date range."""
        result = []
        for measurement in measurements:
            if options.date_from is not None and measurement.date < options.date_from:
                continue
            if options.date_to is not None and measurement.date > options.date_to:
                continue
            result.append(measurement)
        reti = result
        return reti

    def _page(
        self,
        client,
        measurements,
        page: int,
        pages: int,
        total: int,
        start: int,
        end: int,
        options: ReportOptions,
        phrases: dict,
        first_date,
        last_date,
        generated_time: str,
    ) -> str:
        """Build one physical report page."""
        title = phrases.get("medical_data_report", "Medical data report")
        header = ""
        if options.include_header and page == 1:
            header = (
                "<header>"
                f"<p>{html.escape(title)}</p>"
                f"<p>{html.escape(client.surname)} {html.escape(client.name)} "
                f"({html.escape(client.personal_id)})</p>"
                f"<p>{html.escape(phrases.get('page', 'Page'))} "
                f"<strong>{page}</strong> {html.escape(phrases.get('of', 'of'))} "
                f"<strong>{pages}</strong></p>"
                "</header>"
            )

        personal = ""
        if options.include_personal_data and page == 1:
            personal = self._personal(client, phrases, options.language)

        first = self._date_text(first_date, options.language)
        last = self._date_text(last_date, options.language)
        found = phrases.get("found_records", "Found")
        records_range = phrases.get("records_in_range", "records in the era from")
        to = phrases.get("to", "to")
        showing = phrases.get("showing_records", "Showing records")

        range_info = ""
        if page == 1:
            range_info = (
                "<article>"
                f"<p>{html.escape(found)} <strong>{total}</strong> "
                f"{html.escape(records_range)} <strong>{html.escape(first)}</strong> "
                f"{html.escape(to)} <strong>{html.escape(last)}</strong>.</p>"
                "</article>"
            )

        report_heading = f'<h2>{html.escape(phrases.get("report_data", "Report data"))}</h2>' if page == 1 else ""
        report_data = (
            '<section id="report-data">'
            + report_heading
            + range_info
            + "<article>"
            f"<p>{html.escape(showing)} <strong>{start if measurements else 0}</strong> "
            f"{html.escape(to)} <strong>{end if measurements else 0}</strong> "
            f"{html.escape(phrases.get('of', 'of'))} <strong>{total}</strong>.</p>"
            "</article>"
            f"{self._table(measurements, options, phrases)}"
            "</section>"
        )

        footer = ""
        if options.include_footer:
            generated = phrases.get("generated", "Date and time of generation")
            footer = (
                "<footer>"
                f"<p>MediRec v{html.escape(self._application_version)}</p>"
                f"<p>({html.escape(options.language)})</p>"
                f"<p>{html.escape(generated)}: <strong>{html.escape(generated_time)}</strong></p>"
                "</footer>"
            )

        title_heading = f"<h1>{html.escape(title)}</h1>" if page == 1 else ""
        end_message = f'<p class="end-of-report">{html.escape(phrases.get("end_of_report", "End of the report."))}</p>' if page == pages else ""
        reti = (
            '<section class="report-page">'
            + header
            + "<main>"
            + title_heading
            + personal
            + report_data
            + "</main>"
            + end_message
            + footer
            + "</section>"
        )
        return reti

    @staticmethod
    def _rows_per_page(options: ReportOptions, first_page: bool) -> int:
        """Estimate the number of rows that fit on a report page."""
        page_heights = {"A4": 297, "A3": 420, "A5": 210, "Letter": 279, "Legal": 356}
        page_widths = {"A4": 210, "A3": 297, "A5": 148, "Letter": 216, "Legal": 216}
        page_size = options.page_size if options.page_size in page_heights else "A4"
        page_height = page_widths[page_size] if options.page_orientation == "landscape" else page_heights[page_size]
        margins = {"none": 0, "small": 10, "normal": 24, "large": 40}
        available_height = page_height - margins.get(options.margins, 0)
        reserved_height = 30 if first_page else 18
        if options.include_header and first_page:
            reserved_height += 14
        if options.include_personal_data and first_page:
            reserved_height += 46
        if options.include_footer:
            reserved_height += 22
        row_height = 8
        return max(1, int((available_height - reserved_height) // row_height))

    def _personal(self, client, phrases: dict, language: str) -> str:
        """Build the personal-data section from the supplied template."""
        company = None
        for item in self._storage.list_health_insurance_companies():
            if item.abbreviation == client.health_insurance_abbreviation:
                company = item
                break

        code = company.code if company is not None else ""
        company_name = company.name if company is not None else ""
        labels = {
            "name": phrases.get("name", "Name"),
            "surname": phrases.get("surname", "Surname"),
            "date_of_birth": phrases.get("date_of_birth", "Date of birth"),
            "age": phrases.get("age", "Age"),
            "personal_id": phrases.get("personal_id", "Personal ID"),
            "sex": phrases.get("sex", "Sex"),
            "insurance": phrases.get("health_insurance_companies", "Health insurance company"),
        }

        values = [
            ("name-header", "name-val", labels["name"], client.name),
            ("surname-header", "surname-val", labels["surname"], client.surname),
            ("birth-header", "birth-val", labels["date_of_birth"], self._date_text(client.date_of_birth, language)),
            ("age-header", "age-val", labels["age"], self._age(client.date_of_birth)),
            ("pid-header", "pid-val", labels["personal_id"], client.personal_id),
            ("sex-header", "sex-val", labels["sex"], client.sex),
            ("hic-header", "hic-code", labels["insurance"], code),
        ]

        rows = []
        for header_area, value_area, label, value in values:
            rows.append(
                f'<p class="header" style="grid-area: {header_area};">{html.escape(str(label))}</p>'
            )
            value_class = "value start" if value_area == "hic-code" else "value"
            rows.append(
                f'<p class="{value_class}" style="grid-area: {value_area};">{html.escape(str(value))}</p>'
            )

        rows.append(
            f'<p class="value middle" style="grid-area: hic-abbr;">{html.escape(client.health_insurance_abbreviation)}</p>'
        )
        rows.append(
            f'<p class="value end" style="grid-area: hic-name;">{html.escape(company_name)}</p>'
        )

        reti = (
            '<section id="personal-data">'
            f'<h2>{html.escape(phrases.get("personal_data", "Personal data"))}</h2>'
            f'<article>{"".join(rows)}</article>'
            '</section>'
        )
        return reti

    def _table(self, measurements, options: ReportOptions, phrases: dict) -> str:
        """Build the report table using the supplied two-row table header."""
        columns = [column for column in options.columns if column in self.COLUMNS]
        first_headers = []
        second_headers = []

        for column in columns:
            key, fallback, unit = self.COLUMNS[column]
            label = phrases.get(key, fallback)
            if column in {"date", "time", "notes"}:
                first_headers.append(f'<th rowspan="2">{html.escape(label)}</th>')
            else:
                first_headers.append(f'<th colspan="2">{html.escape(label)}</th>')

            if column in {"date", "time", "notes"}:
                continue
            second_headers.append(f'<th colspan="2">{html.escape(unit)}</th>')

        rows = []
        for measurement in measurements:
            cells = []
            for column in columns:
                value = getattr(measurement, column, None)
                if column == "date":
                    value = self._date_text(measurement.date, options.language)
                elif column == "time":
                    value = measurement.time.strftime("%H:%M")

                if value is None:
                    if column in self.INDICATOR_COLUMNS:
                        cells.append('<td class="indicator-empty">&nbsp;</td>')
                        cells.append("<td></td>")
                    else:
                        cells.append("<td></td>")
                    continue

                if column in self.INDICATOR_COLUMNS:
                    indicator = ""
                    if options.include_indicators:
                        status_name = self._status_class(measurement, column)
                        if status_name:
                            indicator = f'<td class="{status_name}">&nbsp;</td>'
                        else:
                            indicator = '<td class="indicator-empty">&nbsp;</td>'
                    else:
                        indicator = '<td class="indicator-empty">&nbsp;</td>'
                    cells.append(indicator)
                    cells.append(f'<td>{html.escape(str(value))}</td>')
                elif column == "height":
                    cells.append(f'<td colspan="2">{html.escape(str(value))}</td>')
                else:
                    cells.append(f'<td>{html.escape(str(value))}</td>')

            rows.append(f'<tr>{"".join(cells)}</tr>')

        reti = (
            '<table id="report-data-table">'
            '<thead>'
            f'<tr>{"".join(first_headers)}</tr>'
            f'<tr>{"".join(second_headers)}</tr>'
            '</thead>'
            f'<tbody>{"".join(rows)}</tbody>'
            '</table>'
        )
        return reti

    @staticmethod
    def _status_class(measurement: HealthMeasurement, column: str) -> str:
        """Return the CSS status class for one measurement value."""
        status_name = {
            "systolic": "systolic_status",
            "diastolic": "diastolic_status",
            "pulse": "pulse_status",
            "oxygen_saturation": "oxygen_status",
            "weight": "weight_status",
            "bmi": "bmi_status",
        }.get(column)
        status = getattr(measurement, status_name, HealthStatus.UNKNOWN)
        classes = {
            HealthStatus.HEALTHY: "ok",
            HealthStatus.CAUTION: "warning",
            HealthStatus.UNHEALTHY: "severe",
            HealthStatus.UNKNOWN: "",
        }
        reti = classes.get(status, "")
        return reti

    @staticmethod
    def _date_text(value, language: str) -> str:
        """Format a date according to report language."""
        if value is None:
            reti = "—"
        elif language == "en":
            reti = value.strftime("%Y-%m-%d")
        elif language in {"cs", "de", "pl"}:
            reti = value.strftime("%d.%m.%Y")
        else:
            reti = value.strftime("%d/%m/%Y")
        return reti

    @staticmethod
    def _date_time_text(value: datetime, language: str) -> str:
        """Format report generation date and time according to language."""
        date_text = ReportService._date_text(value.date(), language)
        reti = f"{date_text} {value.strftime('%H:%M:%S')}"
        return reti

    @staticmethod
    def _age(birth) -> int:
        """Calculate current age."""
        today = datetime.now().date()
        reti = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))
        return reti

    @staticmethod
    def _css(options: ReportOptions) -> str:
        """Return the report stylesheet using validated page options."""
        page_sizes = {"A4", "A3", "A5", "Letter", "Legal"}
        page_size = options.page_size if options.page_size in page_sizes else "A4"
        orientation = options.page_orientation if options.page_orientation in {"portrait", "landscape"} else "portrait"
        page_dimensions = {"A4": (210, 297), "A3": (297, 420), "A5": (148, 210), "Letter": (216, 279), "Legal": (216, 356)}
        page_height = page_dimensions[page_size][1]
        if orientation == "landscape":
            page_height = page_dimensions[page_size][0]
        margin_values = {"none": 0, "small": 5, "normal": 12, "large": 20}
        margin_mm = margin_values.get(options.margins, 0)
        margin = f"{margin_mm}mm"
        content_height = page_height - (2 * margin_mm)
        reti = '''
            @page {
                size: __PAGE_SIZE__ __ORIENTATION__;
                margin: __MARGIN__;
            }

            * {
                padding: 0;
                margin: 0;
                font-size: 10pt;
                vertical-align: middle;
            }

            h1 {
                font-size: 14pt;
            }

            h2 {
                font-size: 12pt;
                margin-top: 1rem;
            }

            body {
                font-family: "Selawik", sans-serif;
            }

            .report-page {
                min-height: __PAGE_HEIGHT__mm;
                display: flex;
                flex-direction: column;
                page-break-after: always;
            }

            .report-page:last-child {
                page-break-after: auto;
            }

            header, footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: "Ubuntu Mono", monospace;
            }

            header {
                margin-bottom: 1rem;
                border-bottom: 2px solid #000;
            }

            footer {
                margin-top: auto;
                border-top: 2px solid #000;
                display: flex;
                flex-wrap: wrap;
                gap: .5rem;
                width: 100%;
                box-sizing: border-box;
            }

            footer p:first-child {
                flex: 1 1 30%;
            }

            footer p:nth-child(2) {
                flex: 0 0 auto;
            }

            footer p:last-child {
                flex: 1 0 100%;
                text-align: right;
            }

            footer p {
                min-width: 0;
                max-width: 100%;
                font-size: 10pt;
                overflow-wrap: anywhere;
                word-break: normal;
            }

            footer p:nth-child(2) { text-align: center; white-space: nowrap; }
            footer strong {
                overflow-wrap: anywhere;
                word-break: normal;
            }
            .end-of-report {
                margin-top: 1rem;
                margin-bottom: 0.75rem;
                text-align: center;
                font-style: italic;
                font-weight: bold;
                overflow-wrap: anywhere;
            }

            .report-page > main {
                flex: 1;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }

            .header {
                background: linear-gradient(rgb(240, 249, 255) 45%, rgb(230, 245, 254) 45%, rgb(199, 216, 224));
                border: 1px solid rgb(133, 174, 195);
                font-weight: 300;
                color: rgb(0, 31, 71);
            }

            #personal-data > article {
                display: grid;
                grid-template-areas:
                    "name-header    name-val    name-val    name-val    name-val"
                    "surname-header surname-val surname-val surname-val surname-val"
                    "birth-header   birth-val   birth-val   age-header  age-val"
                    "pid-header     pid-val     pid-val     sex-header  sex-val"
                    "hic-header     hic-code    hic-abbr    hic-name    hic-name";
                gap: 0;
            }

            #personal-data .header {
                border-top: 1px solid rgb(133, 174, 195);
                border-bottom: 1px solid rgb(133, 174, 195);
                border-left: 1px solid rgb(133, 174, 195);
                margin-top: 0.5rem;
                padding-left: 0.2rem;
            }

            #personal-data .value {
                border-top: 1px solid black;
                border-bottom: 1px solid black;
                border-right: 1px solid black;
                font-family: "Ubuntu Mono", monospace;
                margin-right: 0.5rem;
                margin-top: 0.5rem;
                padding-left: 0.2rem;
            }

            #personal-data .value.start,
            #personal-data .value.middle {
                border-right: none;
                margin-right: 0;
            }

            #personal-data .value.end {
                border-left: none;
                margin-right: 0.5rem;
            }

            #report-data thead {
                background: linear-gradient(rgb(240, 249, 255) 45%, rgb(230, 245, 254) 45%, rgb(199, 216, 224));
                border: 1px solid rgb(133, 174, 195);
                display: table-header-group;
            }

            #report-data th {
                font-weight: 300;
                color: rgb(0, 31, 71);
                text-align: left;
            }

            #report-data tbody td {
                text-align: left;
            }

            #report-data tbody tr {
                break-inside: avoid;
            }

            #report-data td {
                font-family: "Ubuntu Mono", monospace;
            }

            #report-data tbody tr:nth-child(even) {
                background-color: rgb(221, 226, 230);
            }

            #report-data thead tr:nth-child(2) th {
                color: rgb(56, 69, 86);
                font-size: 8pt;
            }

            #report-data tbody td:not(.ok):not(.warning):not(.severe) {
                padding: 0.25rem 0.5rem;
            }

            #report-data td.ok {
                background: linear-gradient(rgb(102, 197, 30) 45%, rgb(93, 185, 23) 45%, rgb(69, 145, 12));
                border: 2px solid rgb(102, 197, 30);
                width: 1rem;
                height: 100%;
            }

            #report-data td.warning {
                background: linear-gradient(rgb(255, 204, 0) 45%, rgb(255, 191, 0) 45%, rgb(204, 153, 0));
                border: 2px solid rgb(255, 204, 0);
                width: 1rem;
                height: 100%;
            }

            #report-data td.severe {
                background: linear-gradient(rgb(255, 0, 0) 45%, rgb(204, 0, 0) 45%, rgb(153, 0, 0));
                border: 2px solid rgb(255, 0, 0);
                width: 1rem;
                height: 100%;
            }

            #report-data td.indicator-empty {
                background: transparent;
                border: none;
            }
        '''
        reti = reti.replace("__PAGE_SIZE__", page_size).replace("__ORIENTATION__", orientation).replace("__MARGIN__", margin).replace("__PAGE_HEIGHT__", str(content_height))
        return reti
