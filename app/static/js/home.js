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
 * Controller for the MediRec home page and all its sections.
 */
class Home {
    /** Initialize the home page. */
    static async main() {
        const ui = Medirec.ui;
        ui.lockLoader();

        try {
            const metadata = await Medirec.api.fetchLanguageMeta();
            const resources = await Home.#updateLanguages(metadata);
            LanguageBase.languages = resources;
            Medirec.languageSwitch.setLanguages(metadata);
            Medirec.languageSwitch.initialize(LanguageBase.currentLanguage);
            LanguageBase.addChangeListener(async () => {
                Home.#refreshVisibleText();
                await Home.#loadData();
            });
            await Home.#loadData();
            Home.#navigation();
            ui.forceUnlockLoader();
            ui.hidePreloader();
            ui.showContent();
        } catch (error) {
            ui.forceUnlockLoader();
            ui.hideContent();
            ui.showDialog(
                "error",
                "Start of the application failed!",
                "Application could not start. Please try again later.",
                String(error),
                [[() => window.location.reload(), "Try again", "refresh-sharp"]],
                true
            );
        }
    }

    /**
     * Update cached language resources when their server version changes.
     * @param {object[]} metadata Server language metadata.
     * @returns {Promise<object[]>} Current language resources.
     */
    static async #updateLanguages(metadata) {
        const database = await Home.#openLanguageDatabase();
        const cached = await Home.#readLanguages(database);
        const cacheByCode = Object.fromEntries(cached.map((item) => [item.code, item]));
        const resources = [];

        for (const meta of metadata) {
            const existing = cacheByCode[meta.code];
            if (existing !== undefined && existing.version === meta.version) {
                resources.push(existing);
            } else {
                try {
                    const fresh = await Medirec.api.fetchLanguage(meta.code);
                    await Home.#saveLanguage(database, fresh);
                    resources.push(fresh);
                } catch (error) {
                    if (existing !== undefined) {
                        resources.push(existing);
                    } else {
                        throw error;
                    }
                }
            }
        }

        database.close();
        const reti = resources;
        return reti;
    }

    /** @returns {Promise<IDBDatabase>} Opened language database. */
    static #openLanguageDatabase() {
        const reti = new Promise((resolve, reject) => {
            const request = indexedDB.open("medirec-languages", 1);
            request.onupgradeneeded = () => {
                request.result.createObjectStore("languages", {keyPath: "code"});
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return reti;
    }

    /**
     * Read all cached languages.
     * @param {IDBDatabase} database Language database.
     * @returns {Promise<object[]>} Cached resources.
     */
    static #readLanguages(database) {
        const reti = new Promise((resolve, reject) => {
            const request = database.transaction("languages", "readonly")
                .objectStore("languages")
                .getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
        return reti;
    }

    /**
     * Save one language resource.
     * @param {IDBDatabase} database Language database.
     * @param {object} language Language resource.
     * @returns {Promise<void>} Save completion.
     */
    static #saveLanguage(database, language) {
        const reti = new Promise((resolve, reject) => {
            const request = database.transaction("languages", "readwrite")
                .objectStore("languages")
                .put(language);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        return reti;
    }

    /** Refresh all data after a language or workbook change. */
    static async refreshData() {
        const reti = await Home.#loadData();
        return reti;
    }

    /** Load all current workbook data. */
    static async #loadData() {
        const [clients, companies] = await Promise.all([
            Medirec.api.fetchClients(),
            Medirec.api.fetchHealthInsuranceCompanies()
        ]);
        Home.#renderClients(clients);
        Home.#renderCompanies(companies);
        NewHIC.initialize();
        NewClient.initialize(companies);
    }

    /** Configure hash-based section navigation. */
    static #navigation() {
        const showSection = () => {
            const requested = window.location.hash.substring(1) || "content";
            const valid = ["content", "hic", "new-hic", "new-client", "client", "reports", "report-history", "new-measurement"];
            const target = valid.includes(requested) ? requested : "content";
            if (target === "new-measurement") {
                NewClient.prepareMeasurementForm();
            }
            if (target === "reports") {
                Report.refresh();
            }
            if (target === "report-history") {
                Report.loadHistory();
            }

            for (const section of document.querySelectorAll("main > section")) {
                section.classList.toggle("hidden", section.id !== target);
                const navigation = section.querySelector("nav");
                if (navigation !== null) {
                    navigation.classList.remove("menu-open");
                }
            }
        };

        window.addEventListener("hashchange", showSection);
        showSection();
    }

    /** Re-render translated dynamic values after a language change. */
    static #refreshVisibleText() {
        LanguageBase.apply();
        if (NewClient.client !== null) {
            NewClient.renderCurrentClient();
        }
    }

    /**
     * Render the compact client table.
     * @param {object[]} clients Clients returned by the API.
     */
    static #renderClients(clients) {
        const body = document.querySelector("#clients-table tbody");
        body.innerHTML = "";

        for (const client of clients) {
            const summary = document.createElement("tr");
            summary.className = "expandable-row";
            summary.innerHTML = [
                `<td>${Home.#escape(client.surname)}</td>`,
                `<td>${Home.#escape(client.name)}</td>`,
                `<td>${Home.#formatDate(client.date_of_birth)}</td>`,
                `<td>${Home.#calculateAge(client.date_of_birth)}</td>`
            ].join("");

            const details = document.createElement("tr");
            details.className = "expanded-row hidden";
            details.innerHTML = `
                <td colspan="4">
                    <div class="expanded-data">
                        <span><b>${Home.#escape(LanguageBase.translate("personal_id"))}:</b> ${Home.#escape(client.personal_id)}</span>
                        <span><b>${Home.#escape(LanguageBase.translate("sex"))}:</b> ${Home.#escape(client.sex)}</span>
                        <span><b>${Home.#escape(LanguageBase.translate("insurance"))}:</b> ${Home.#escape(client.health_insurance_abbreviation)}</span>
                        <div class="row-actions">
                            <button class="wicon red delete-client" type="button">
                                <ion-icon name="trash-sharp" class="icon"></ion-icon>
                                <span>${Home.#escape(LanguageBase.translate("delete_user"))}</span>
                            </button>
                            <button class="wicon green select-client" type="button">
                                <ion-icon name="person-sharp" class="icon"></ion-icon>
                                <span>${Home.#escape(LanguageBase.translate("select_user"))}</span>
                            </button>
                        </div>
                    </div>
                </td>`;

            summary.addEventListener("click", () => {
                details.classList.toggle("hidden");
            });
            details.querySelector(".delete-client").addEventListener("click", (event) => {
                event.stopPropagation();
                Home.#confirmDelete(client);
            });
            details.querySelector(".select-client").addEventListener("click", (event) => {
                event.stopPropagation();
                NewClient.select(client.identifier);
            });
            body.append(summary, details);
        }

        document.querySelector("#client-search").oninput = (event) => {
            Home.#filterTable("#clients-table", event.target.value);
        };
    }

    /**
     * Render the health-insurance-company table.
     * @param {object[]} companies Health insurance companies.
     */
    static #renderCompanies(companies) {
        const body = document.querySelector("#hic-table tbody");
        body.innerHTML = "";

        for (const company of companies) {
            const summary = document.createElement("tr");
            summary.className = "expandable-row";
            summary.innerHTML = [
                `<td>${Home.#escape(company.abbreviation)}</td>`,
                `<td>${Home.#escape(company.name)}</td>`,
                `<td>${Home.#escape(company.code)}</td>`
            ].join("");

            const details = document.createElement("tr");
            details.className = "expanded-row hidden";
            details.innerHTML = `
                <td colspan="3">
                    <div class="expanded-data">
                        <span><b>${Home.#escape(LanguageBase.translate("notes"))}:</b> ${Home.#escape(company.notes)}</span>
                    </div>
                </td>`;

            summary.addEventListener("click", () => {
                details.classList.toggle("hidden");
            });
            body.append(summary, details);
        }

        document.querySelector("#hic-search").oninput = (event) => {
            Home.#filterTable("#hic-table", event.target.value);
        };
    }

    /**
     * Filter a table by its visible text.
     * @param {string} selector Table selector.
     * @param {string} query Search text.
     */
    static #filterTable(selector, query) {
        const value = query.trim().toLocaleLowerCase();
        const rows = document.querySelectorAll(`${selector} tbody tr.expandable-row`);
        for (const row of rows) {
            row.classList.toggle(
                "hidden",
                value !== "" && !row.textContent.toLocaleLowerCase().includes(value)
            );
        }
    }

    /**
     * Display the delete confirmation dialog.
     * @param {object} client Client to delete.
     */
    static #confirmDelete(client) {
        const message = `${LanguageBase.translate("delete_confirmation")} ${client.surname} ${client.name}?`;
        Medirec.ui.showDialog(
            "question",
            LanguageBase.translate("delete_user"),
            message,
            "",
            [[async () => Home.#delete(client), LanguageBase.translate("delete"), "trash-sharp"]],
            true
        );
    }

    /**
     * Delete a client after confirmation.
     * @param {object} client Client to delete.
     */
    static async #delete(client) {
        Medirec.ui.showWait();
        try {
            await Medirec.api.deleteClient(client.identifier);
            await Home.#loadData();
            Medirec.ui.showDialog(
                "success",
                LanguageBase.translate("deleted"),
                LanguageBase.translate("user_deleted"),
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
     * Format an ISO date according to the currently selected language.
     * @param {string} value ISO date.
     * @returns {string} Localized date.
     */
    static #formatDate(value) {
        const locale = LanguageBase.code || "en";
        const date = new Date(`${value}T00:00:00`);
        const reti = Number.isNaN(date.getTime())
            ? value
            : new Intl.DateTimeFormat(locale, {dateStyle: "medium"}).format(date);
        return reti;
    }

    /**
     * Calculate a client's age.
     * @param {string} value ISO date of birth.
     * @returns {number|string} Age in complete years.
     */
    static #calculateAge(value) {
        const birth = new Date(`${value}T00:00:00`);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const birthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
        if (today < birthday) {
            age -= 1;
        }
        const reti = Number.isNaN(birth.getTime()) ? "" : age;
        return reti;
    }

    /**
     * Escape dynamic text before inserting it into HTML.
     * @param {unknown} value Text value.
     * @returns {string} Escaped HTML text.
     */
    static #escape(value) {
        const element = document.createElement("span");
        element.textContent = value ?? "";
        const reti = element.innerHTML;
        return reti;
    }
}
