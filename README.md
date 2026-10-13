# MediRec

MediRec is a small FastAPI application for storing basic medical records in an Excel XLSX workbook. The application is intended to run on a Raspberry Pi or another Linux system and provides the existing MediRec web interface through FastAPI.

| Table of contents |
|---|
| [1. Installation](#installation) |
| [1.1. Project download](#11-project-download) |
| [1.2. Dependencies installation](#12-dependencies-installation) |
| [2. Configuration](#configuration) |
| [3. Application start](#application-start) |
| [4. Workbook structure](#workbook-structure) |
| [5. Web interface](#web-interface) |
| [6. Additional notes](#additional-notes) |

## Installation

MediRec needs Python 3 to run. Python 3 is usually preinstalled on current Linux distributions, including Raspberry Pi OS. The following steps assume that Python 3 and `pip` are already available.

### 1.1. Project download

The easiest way to obtain the project is to clone the repository.

```bash
mkdir /path/to/the/project
cd /path/to/the/project
git clone <repository-url>
```

Use any suitable directory instead of `/path/to/the/project`.

### 1.2. Dependencies installation

The complete list of external Python dependencies is provided in [`requirements.txt`](requirements.txt). Install them with `pip`.

```bash
pip install -r requirements.txt
```

Using a Python virtual environment is recommended for a system installation.

```bash
python3 -m venv /path/to/the/project/.venv
source /path/to/the/project/.venv/bin/activate
pip install -r /path/to/the/project/requirements.txt
```

The application is then ready to run.

## Configuration

MediRec reads its configuration from an INI file. The configuration file can be stored anywhere and its path is supplied to the application as a command-line argument.

| Section | Name | Description |
|---|---|---|
| `[server]` | `address` | Address on which the application accepts HTTP requests. For example, `0.0.0.0` accepts connections on all interfaces, while `127.0.0.1` accepts local connections only. |
| `[server]` | `port` | TCP port on which the application listens. No other application should use this port. |
| `[medirec]` | `workbook` | Path to the XLSX workbook used as the MediRec database. |
| `[medirec]` | `reports` | Path to the directory in which generated reports are stored. |

An example configuration is provided in [`medirec.ini.example`](medirec.ini.example).

```ini
[server]
address=127.0.0.1
port=8080

[medirec]
workbook=/var/lib/medirec/medirec.xlsx
reports=/var/lib/medirec/reports
```

The workbook and reports paths may be absolute or user-relative paths. The reports directory is created automatically when the application starts.

## Application start

With an existing INI configuration, start MediRec with:

```bash
python /path/to/the/project/app/main.py --ini /path/to/the/configuration/medirec.ini
```

Alternatively, start the module from the project directory:

```bash
python -m app.main --ini /path/to/the/configuration/medirec.ini
```

The application listens on the address and port configured in `[server]`.

FastAPI's OpenAPI, Swagger UI and ReDoc endpoints are intentionally disabled. MediRec is intended to expose its own user interface rather than an automatically generated API documentation interface.

## Workbook structure

The XLSX workbook is the application's database. It must initially contain these two worksheets:

- `HealthInsuranceCompanies`
- `_template`

### HealthInsuranceCompanies

Health-insurance companies are stored starting at row 5:

| Column | Data |
|---|---|
| A | Abbreviation |
| B | Name |
| C | Code |
| D | Notes |

### _template

`_template` is copied whenever a new client is created.

Personal data are stored in the following merged-cell areas:

| Cells | Data |
|---|---|
| C2:J3 | Surname |
| C4:P5 | Name |
| N2:P3 | Generated primary identifier |
| C6:G7 | Date of birth |
| C8:G9 | Personal ID |
| J8:P9 | Sex (`M` or `F`) |
| E10:F11 | Health-insurance-company abbreviation |

Health measurements start at row 16:

| Column | Data |
|---|---|
| A | Date |
| B | Time |
| C | Systolic indicator |
| D | Systolic pressure |
| E | Diastolic indicator |
| F | Diastolic pressure |
| G | Pulse indicator |
| H | Pulse |
| I | O₂ saturation indicator |
| J | O₂ saturation |
| K | Height |
| L | Weight indicator |
| M | Weight |
| N | BMI indicator |
| O | BMI |
| P | Notes |

Client worksheet names have the form:

```text
Surname_Name_PersonalID
```

Surname and name are converted to ASCII where possible. Excel's 31-character worksheet-name limit is respected. The personal ID is used for the worksheet name; the generated primary identifier is stored separately in `N2:P3` and is never used as the worksheet-name component.

The primary identifier is generated automatically when the client is created and is used by the API to identify the client. The personal ID is not used as the application's primary key.

### Data consistency

The XLSX file is treated as a real database file and is never intentionally left half-written. Workbook access uses an inter-process lock. A write is performed on a loaded workbook and published by writing a temporary XLSX in the same directory, flushing it to disk, validating that it can be reopened, and atomically replacing the old workbook.

This means that a failed write does not replace the last known-good workbook with a partially written ZIP/XLSX file. The same lock also prevents concurrent MediRec processes from modifying the workbook simultaneously.

## Web interface

The web interface keeps the existing MediRec visual language, including its navigation, buttons, forms, language selector, dialogs, fonts, icons and responsive layout.

The main sections are:

- **Registered clients** — shows only surname, name, localized date of birth and age in the compact table. Clicking a row expands additional client data and provides **Delete user** and **Select user** actions.
- **Health insurance companies** — shows the most important company data in the table and expands to show notes.
- **New client** — creates a client. The primary identifier is generated automatically.
- **Selected client** — shows all client data and all stored health measurements.
- **New measurement** — a separate section for entering a new health measurement.

Form actions are available in the section's top navigation on desktop. On mobile, the same actions are additionally available below the form.

The language selector is present in every section.

On mobile, each form provides Cancel and Save controls below the form, each occupying approximately half of the available width. The new-measurement form is prefilled with the current local date and time and uses the latest stored values as placeholders. Language resources are versioned individually. The browser stores downloaded language resources in IndexedDB and requests a language again only when the server reports a different version. This allows language updates without redownloading unchanged languages.

Dates displayed by the application are localized according to the selected language.

Health indicators are represented by separate colored rectangles immediately to the left of their numeric values. They are not applied as backgrounds to the complete value cell.

## Reporting
The application can generate PDF medical reports from a selected client. Reports are created from HTML using WeasyPrint and are stored in the configured `[medirec]` `reports` directory. The report editor follows the supplied medical-data report template and provides options for personal data, header, footer, indicators, selected measurement columns, date range and report language.

On desktop and tablet, report settings and the generated preview are displayed side by side. On mobile, report settings can be opened using the settings button. The **Print**, **Save to server** and **Download** actions are available in the report section's top navigation. Every generated report is saved as a PDF on the server.

Generated reports have their own **Report history** section for the selected client. Each report page contains at most 10 records and repeats the report header, measurement table header and footer when selected. Dates and times in the report are localized according to the selected report language.

## Additional notes

MediRec is suitable for running behind a web server such as Apache HTTP Server. If the application is exposed outside a trusted local network, it should be protected by an appropriate reverse proxy, HTTPS and authentication/authorization.

It is also recommended to run MediRec as a system service so that it starts automatically after the device boots. The exact service configuration depends on the Linux distribution and deployment layout.

The application uses an XLSX workbook rather than a database server, so the workbook itself should be backed up regularly.

---

Made with ❤️ in 🇪🇺 by [Jiri Skoda](mailto:developer@skodaj.cz).


