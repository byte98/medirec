// MediRec - simple web application to save some basic medical records.
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; version 2 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

/**
 * Controller for report creation, preview and report history.
 */
class Report {
    /**
     * Initialize report controls.
     */
    static initialize() {
        const form = document.querySelector("#report-form");
        const language = document.querySelector("#report-language");
        if (form === null || language === null || form.dataset.initialized === "true") {
            return;
        }

        form.dataset.initialized = "true";
        Report.#fillLanguages(language);
        Report.#initializeSelectionIcons();

        form.addEventListener("change", (event) => {
            if (event.target.matches(".report-select")) {
                Report.#updateSelectionIcon(event.target);
            }
            if (event.target.matches("input[name='column']")) {
                Report.#syncColumnSelection();
            }
            Report.preview();
        });

        const selectAllColumns = document.querySelector("#report-select-all-columns");
        selectAllColumns?.addEventListener("change", () => {
            for (const checkbox of form.querySelectorAll("input[name='column']")) {
                checkbox.checked = selectAllColumns.checked;
            }
            Report.preview();
        });

        const reportSettings = document.querySelector("#report-settings-panel");
        if (reportSettings !== null) {
            reportSettings.addEventListener("click", (event) => {
                const tab = event.target.closest("[data-report-tab]");
                if (tab === null || !reportSettings.contains(tab)) {
                    return;
                }
                event.preventDefault();
                const target = tab.dataset.reportTab;
                for (const item of reportSettings.querySelectorAll("[data-report-tab]")) {
                    const selected = item === tab;
                    item.setAttribute("aria-selected", String(selected));
                    item.setAttribute("tabindex", selected ? "0" : "-1");
                }
                for (const panel of reportSettings.querySelectorAll("[data-report-panel]")) {
                    const selected = panel.dataset.reportPanel === target;
                    panel.classList.toggle("hidden", !selected);
                    panel.hidden = !selected;
                }
            });
        }

        const settingsToggle = document.querySelector("#report-settings-toggle");
        if (settingsToggle !== null) {
            settingsToggle.addEventListener("click", () => {
                const settings = document.querySelector("#report-settings-panel");
                if (settings !== null) {
                    settings.classList.toggle("report-settings-open");
                }
            });
        }

        document.querySelector("#report-print")?.addEventListener("click", () => Report.#generate("print"));
        document.querySelector("#report-download")?.addEventListener("click", () => Report.#generate("download"));

        Report.preview();
    }

    /**
     * Refresh the report preview when the report section becomes visible.
     */
    static refresh() {
        const form = document.querySelector("#report-form");
        if (form !== null && form.dataset.initialized === "true") {
            Report.preview();
        }
    }


    /**
     * Set meaningful icons for report selectors where a visual icon helps
     * identify the selected value. Selectors without a useful icon remain
     * text-only.
     */
    static #initializeSelectionIcons() {
        for (const select of document.querySelectorAll(".report-select")) {
            Report.#updateSelectionIcon(select);
        }
    }

    /**
     * Update the icon shown alongside a report selector's current value.
     * @param {HTMLSelectElement} select Report selector.
     */
    static #updateSelectionIcon(select) {
        const icon = select.parentElement?.querySelector("ion-icon");
        if (icon === null || icon === undefined) {
            return;
        }

        const icons = {
            "report-language": "language-sharp",
            "report-orientation": select.value === "landscape" ? "tablet-landscape-sharp" : "tablet-portrait-sharp",
            "report-page-size": "document-sharp"
        };
        const selectedIcon = icons[select.id];
        if (selectedIcon) {
            icon.setAttribute("name", selectedIcon);
        }
    }

    /**
     * Fill report language selector.
     * @param {HTMLSelectElement} select Language selector.
     */
    static #fillLanguages(select) {
        select.innerHTML = "";
        for (const language of LanguageBase.languages) {
            const option = document.createElement("option");
            option.value = language.code;
            option.textContent = language.nativeName;
            option.selected = language.code === LanguageBase.code;
            select.appendChild(option);
        }
    }

    /**
     * Keep the select-all checkbox synchronized with the individual columns.
     */
    static #syncColumnSelection() {
        const selectAll = document.querySelector("#report-select-all-columns");
        const columns = [...document.querySelectorAll("#report-form input[name='column']")];
        if (selectAll !== null) {
            selectAll.checked = columns.length > 0 && columns.every((column) => column.checked);
            selectAll.indeterminate = columns.some((column) => column.checked) && !selectAll.checked;
        }
    }

    /**
     * Build report options from the settings form.
     * @returns {object} Report options.
     */
    static #options() {
        const form = document.querySelector("#report-form");
        const columns = [...form.querySelectorAll("input[name='column']:checked")].map((input) => input.value);
        const reti = {
            include_personal_data: form.elements.namedItem("include_personal_data").checked,
            include_footer: form.elements.namedItem("include_footer").checked,
            include_header: form.elements.namedItem("include_header").checked,
            include_indicators: form.elements.namedItem("include_indicators").checked,
            columns: columns,
            date_from: form.elements.namedItem("date_from").value || null,
            date_to: form.elements.namedItem("date_to").value || null,
            language: form.elements.namedItem("language").value,
            page_size: form.elements.namedItem("page_size").value,
            page_orientation: form.elements.namedItem("page_orientation").value,
            margins: form.elements.namedItem("margins").value
        };
        return reti;
    }

    /**
     * Refresh the HTML report preview.
     */
    static async preview() {
        const client = NewClient.client;
        const frame = document.querySelector("#report-preview");
        if (client === null || frame === null) {
            return;
        }

        try {
            const content = await Medirec.api.previewReport(client.identifier, Report.#options());
            frame.srcdoc = content;
        } catch (error) {
            frame.srcdoc = `<p style="font-family:sans-serif;padding:1rem">${Report.#escape(String(error))}</p>`;
        }
    }

    /**
     * Generate a PDF report. Every generated report is stored on the server.
     * @param {string} action Requested action.
     */
    static async #generate(action) {
        const client = NewClient.client;
        if (client === null) {
            return;
        }

        Medirec.ui.showWait();
        try {
            const response = await Medirec.api.createReport(client.identifier, Report.#options());
            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.detail || `HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const filename = response.headers.get("X-Report-Filename") || "medirec-report.pdf";

            if (action === "print") {
                const windowObject = window.open(url, "_blank");
                if (windowObject !== null) {
                    windowObject.addEventListener("load", () => windowObject.print(), {once: true});
                }
            } else if (action === "download") {
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.click();
            }

            await Report.loadHistory();
            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
            Medirec.ui.showDialog("error", LanguageBase.translate("error"), String(error), "", [[]], true);
        } finally {
            Medirec.ui.hideWait();
        }
    }

    /**
     * Load report history for the selected client.
     */
    static async loadHistory() {
        const client = NewClient.client;
        const target = document.querySelector("#report-history-list");
        if (client === null || target === null) {
            return;
        }

        try {
            const reports = await Medirec.api.fetchReports(client.identifier);
            target.innerHTML = "";

            if (reports.length === 0) {
                target.textContent = LanguageBase.translate("no_reports");
            }

            for (const report of reports) {
                const item = document.createElement("article");
                item.className = "report-history-item";

                const information = document.createElement("div");
                const link = document.createElement("a");
                link.href = `api/clients/${encodeURIComponent(client.identifier)}/reports/${encodeURIComponent(report.name)}`;
                link.textContent = report.name;
                link.target = "_blank";
                information.appendChild(link);

                const created = document.createElement("small");
                created.textContent = report.created;
                information.appendChild(document.createElement("br"));
                information.appendChild(created);

                const download = document.createElement("a");
                download.href = link.href;
                download.download = report.name;
                download.textContent = LanguageBase.translate("download");

                item.appendChild(information);
                item.appendChild(download);
                target.appendChild(item);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Escape text used in the preview error message.
     * @param {string} value Text to escape.
     * @returns {string} Escaped text.
     */
    static #escape(value) {
        const reti = value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
        return reti;
    }
}
