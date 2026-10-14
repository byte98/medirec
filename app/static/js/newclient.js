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
 * Controller for client creation and selected-client data.
 */
class NewClient {
    /** @type {object[]} @private */
    static #companies = [];

    /** @type {object|null} @private */
    static #client = null;

    /**
     * Initialize the new-client form.
     * @param {object[]} companies Available health-insurance companies.
     */
    static initialize(companies) {
        NewClient.#companies = companies;
        const select = document.querySelector("#client-insurance");
        select.innerHTML = "";

        for (const company of companies) {
            const option = document.createElement("option");
            option.value = company.abbreviation;
            option.textContent = `${company.abbreviation} — ${company.name}`;
            select.appendChild(option);
        }

        const form = document.querySelector("#new-client-form");
        if (form.dataset.initialized !== "true") {
            form.dataset.initialized = "true";
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                const data = Object.fromEntries(new FormData(form).entries());
                data.sex = data.sex.toUpperCase();
                Medirec.ui.showWait();

                try {
                    const client = await Medirec.api.createClient(data);
                    form.reset();
                    await Home.refreshData();
                    await NewClient.select(client.identifier);
                } catch (error) {
                    Medirec.ui.showDialog(
                        "error",
                        LanguageBase.translate("error"),
                        String(error),
                        "",
                        [[]],
                        true
                    );
                } finally {
                    Medirec.ui.hideWait();
                }
            });
        }
    }

    /** @returns {object|null} Currently selected client. */
    static get client() {
        const reti = NewClient.#client;
        return reti;
    }

    /**
     * Select a client by the generated primary identifier.
     * @param {string} identifier Primary identifier.
     */
    static async select(identifier) {
        Medirec.ui.showWait();
        try {
            const client = await Medirec.api.fetchClient(identifier);
            NewClient.#client = client;
            NewClient.renderCurrentClient();
            NewClient.#prepareMeasurementForm(document.querySelector("#measurement-form"));
            window.location.hash = "#client";
        } catch (error) {
            Medirec.ui.showDialog(
                "error",
                LanguageBase.translate("error"),
                String(error),
                "",
                [[]],
                true
            );
        } finally {
            Medirec.ui.hideWait();
        }
    }

    /** Render all data belonging to the selected client. */
    static renderCurrentClient() {
        if (NewClient.#client === null) {
            return;
        }

        const client = NewClient.#client;
        document.querySelector("#client-title").textContent = `${client.surname} ${client.name}`;
        NewClient.#renderDetails(client);
        NewClient.#renderMeasurements(client.measurements);
    }

    /**
     * Render every personal-data field of the selected client.
     * @param {object} client Selected client.
     */
    static #renderDetails(client) {
        const details = document.querySelector("#client-details");
        const labels = {
            surname: "surname",
            name: "name",
            date_of_birth: "date_of_birth",
            personal_id: "personal_id",
            sex: "sex",
            health_insurance_abbreviation: "insurance",
            identifier: "identifier"
        };
        const values = {
            surname: client.surname,
            name: client.name,
            date_of_birth: NewClient.#formatDate(client.date_of_birth),
            personal_id: client.personal_id,
            sex: client.sex,
            health_insurance_abbreviation: client.health_insurance_abbreviation,
            identifier: client.identifier
        };

        details.innerHTML = "";
        for (const key of Object.keys(labels)) {
            const item = document.createElement("div");
            item.className = "client-detail";

            const label = document.createElement("strong");
            label.textContent = `${LanguageBase.translate(labels[key])}:`;

            const value = document.createElement("span");
            value.textContent = values[key] ?? "";

            item.append(label, value);
            details.appendChild(item);
        }
    }

    /**
     * Render the selected client's measurements.
     * @param {object[]} measurements Measurements returned by the API.
     */
    static #renderMeasurements(measurements) {
        const body = document.querySelector("#measurements-table tbody");
        body.innerHTML = "";

        // Sort meassurements by date and time, newest first
        measurements.sort((a, b) => {
            const aStr = `${a.date}T${a.time}`;
            const bStr = `${b.date}T${b.time}`;
            const aDate = Date.parse(aStr);
            const bDate = Date.parse(bStr);
            return bDate - aDate;
        });

        for (const measurement of measurements) {
            const summary = document.createElement("tr");
            summary.className = "measurement-summary";
            summary.innerHTML = [
                `<td>${NewClient.#escape(NewClient.#formatDate(measurement.date))}</td>`,
                `<td>${NewClient.#escape(NewClient.#formatTime(measurement.time))}</td>`,
                NewClient.#measurementCell(measurement.systolic, measurement.systolic_status),
                NewClient.#measurementCell(measurement.diastolic, measurement.diastolic_status),
                NewClient.#measurementCell(measurement.pulse, measurement.pulse_status),
                NewClient.#measurementCell(measurement.oxygen_saturation, measurement.oxygen_status),
                `<td>${NewClient.#escape(measurement.height ?? "")}</td>`,
                NewClient.#measurementCell(measurement.weight, measurement.weight_status),
                NewClient.#measurementCell(measurement.bmi, measurement.bmi_status),
                `<td>${NewClient.#escape(measurement.notes ?? "")}</td>`
            ].join("");

            const details = document.createElement("tr");
            details.className = "measurement-expanded hidden";
            details.innerHTML = `<td colspan="10">${NewClient.#measurementDetails(measurement)}</td>`;
            summary.addEventListener("click", () => {
                details.classList.toggle("hidden");
            });
            body.append(summary, details);
        }
    }

    /**
     * Create the expanded mobile representation of one measurement.
     * @param {object} measurement Measurement data.
     * @returns {string} Expanded measurement HTML.
     */
    static #measurementDetails(measurement) {
        const fields = [
            ["date", NewClient.#formatDate(measurement.date)],
            ["time", NewClient.#formatTime(measurement.time)],
            ["systolic", measurement.systolic],
            ["diastolic", measurement.diastolic],
            ["pulse", measurement.pulse],
            ["oxygen", measurement.oxygen_saturation],
            ["height", measurement.height],
            ["weight", measurement.weight],
            ["bmi", measurement.bmi],
            ["notes", measurement.notes]
        ];
        const parts = [];
        for (const field of fields) {
            const value = field[1] ?? "";
            parts.push(`<div class="measurement-detail"><strong>${NewClient.#escape(LanguageBase.translate(field[0]))}</strong><span>${NewClient.#escape(value)}</span></div>`);
        }
        const reti = `<div class="measurement-detail-grid">${parts.join("")}</div>`;
        return reti;
    }

    /**
     * Create one measurement value cell with an optional indicator.
     * @param {number|null} value Measurement value.
     * @param {string} status Indicator status.
     * @returns {string} Cell HTML.
     */
    static #measurementCell(value, status) {
        const indicator = value === null || value === undefined || value === ""
            ? ""
            : `<span class="indicator indicator-${NewClient.#escape(status)}" aria-hidden="true"></span>`;
        const number = value === null || value === undefined ? "" : NewClient.#escape(value);
        const reti = `<td class="measurement-value"><span class="measurement-value-content">${indicator}<span class="measurement-number">${number}</span></span></td>`;
        return reti;
    }

    /**
     * Attach the new-measurement form to the currently selected client.
     */
    static initializeMeasurementForm() {
        const form = document.querySelector("#measurement-form");
        NewClient.#prepareMeasurementForm(form);
        if (form.dataset.initialized !== "true") {
            form.dataset.initialized = "true";
            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                if (NewClient.#client !== null) {
                    await NewClient.#submitMeasurement(form);
                }
            });
        }
    }

    /**
     * Prefill the measurement form with the current date/time and latest values.
     * @param {HTMLFormElement} form Measurement form.
     */
    static #prepareMeasurementForm(form) {
        if (form !== null) {
            const now = new Date();
            const date = form.elements.namedItem("date");
            const time = form.elements.namedItem("time");
            if (date !== null && date.value === "") {
                date.value = NewClient.#formatInputDate(now);
            }
            if (time !== null && time.value === "") {
                time.value = NewClient.#formatInputTime(now);
            }
            const measurements = NewClient.#client?.measurements ?? [];
            const latest = measurements.length > 0 ? measurements[0] : null;
            const latestFields = ["systolic", "diastolic", "pulse", "oxygen_saturation", "height", "weight"];
            for (const field of latestFields) {
                const input = form.elements.namedItem(field);
                if (input !== null) {
                    input.placeholder = latest !== null && latest[field] !== null && latest[field] !== undefined
                        ? String(latest[field])
                        : "";
                }
            }
        }
    }

    /**
     * Format a local Date as an HTML date input value.
     * @param {Date} value Date to format.
     * @returns {string} ISO date.
     */
    static #formatInputDate(value) {
        const reti = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
        return reti;
    }

    /**
     * Format a local Date as an HTML time input value.
     * @param {Date} value Date to format.
     * @returns {string} Local time.
     */
    static #formatInputTime(value) {
        const reti = `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
        return reti;
    }

    /**
     * Refresh the new-measurement form defaults.
     */
    static prepareMeasurementForm() {
        const form = document.querySelector("#measurement-form");
        NewClient.#prepareMeasurementForm(form);
    }

    /**
     * Submit a measurement for the selected client.
     * @param {HTMLFormElement} form Measurement form.
     */
    static async #submitMeasurement(form) {
        const data = Object.fromEntries(new FormData(form).entries());
        for (const key of ["systolic", "diastolic", "pulse", "oxygen_saturation", "height", "weight"]) {
            if (data[key] === "") {
                delete data[key];
            } else {
                data[key] = Number(data[key]);
            }
        }

        Medirec.ui.showWait();
        try {
            await Medirec.api.addMeasurement(NewClient.#client.identifier, data);
            NewClient.#client = await Medirec.api.fetchClient(NewClient.#client.identifier);
            form.reset();
            NewClient.renderCurrentClient();
            Report.loadHistory();
            NewClient.#prepareMeasurementForm(form);
            window.location.hash = "#client";
            Medirec.ui.showDialog(
                "success",
                LanguageBase.translate("measurement_saved"),
                LanguageBase.translate("measurement_saved_body"),
                "",
                [[]],
                true,
                2500
            );
        } catch (error) {
            Medirec.ui.showDialog(
                "error",
                LanguageBase.translate("error"),
                String(error),
                "",
                [[]],
                true
            );
        } finally {
            Medirec.ui.hideWait();
        }
    }

    /**
     * Format a date according to the selected language.
     * @param {string} value ISO date.
     * @returns {string} Localized date.
     */
    static #formatDate(value) {
        const date = new Date(`${value}T00:00:00`);
        const reti = Number.isNaN(date.getTime())
            ? value
            : new Intl.DateTimeFormat(LanguageBase.code || "en", {dateStyle: "medium"}).format(date);
        return reti;
    }

    /**
     * Format a time according to the selected language.
     * @param {string} value ISO time.
     * @returns {string} Localized time.
     */
    static #formatTime(value) {
        const date = new Date(`1970-01-01T${value}`);
        const reti = Number.isNaN(date.getTime())
            ? value
            : new Intl.DateTimeFormat(LanguageBase.code || "en", {timeStyle: "short"}).format(date);
        return reti;
    }

    /**
     * Escape dynamic text.
     * @param {unknown} value Text value.
     * @returns {string} Escaped HTML.
     */
    static #escape(value) {
        const element = document.createElement("span");
        element.textContent = value ?? "";
        const reti = element.innerHTML;
        return reti;
    }
}

document.addEventListener("DOMContentLoaded", () => NewClient.initializeMeasurementForm());
