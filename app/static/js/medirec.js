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
 * Main MediRec application controller.
 */
class Medirec {
    /** @type {LanguageSwitch} @private */
    static #languageSwitch;

    /** @type {UI} @private */
    static #ui;

    /** @type {API} @private */
    static #api;

    /** Initialize shared application objects. */
    static async main() {
        Medirec.#languageSwitch = new LanguageSwitch(document.querySelectorAll(".language-switch"));
        Medirec.#ui = new UI(
            document.querySelector("#dialogs"),
            document.querySelector("#title"),
            document.querySelector("main"),
            document.querySelector("#wait")
        );
        Medirec.#api = new API("/api");

        for (const button of document.querySelectorAll(".menu-button")) {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const section = button.closest("section");
                if (section !== null) {
                    const navigation = section.querySelector("nav");
                    if (navigation !== null) {
                        const isOpen = navigation.classList.toggle("menu-open");
                        button.setAttribute("aria-expanded", String(isOpen));
                        const down = button.querySelector(".chevron-down, ion-icon[name='chevron-down-sharp']");
                        const up = button.querySelector(".chevron-up, ion-icon[name='chevron-up-sharp']");
                        if (down !== null) {
                            down.classList.toggle("hidden", isOpen);
                        }
                        if (up !== null) {
                            up.classList.toggle("hidden", !isOpen);
                        }
                    }
                }
            });
        }

        for (const button of document.querySelectorAll("nav > ul > li > button[data-target]")) {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                window.location.hash = button.dataset.target || "";
            });
        }

        await Home.main();
        Report.initialize();
    }

    /** @returns {LanguageSwitch} Language switch controller. */
    static get languageSwitch() {
        const reti = Medirec.#languageSwitch;
        return reti;
    }

    /** @returns {UI} User-interface facade. */
    static get ui() {
        const reti = Medirec.#ui;
        return reti;
    }

    /** @returns {API} HTTP API facade. */
    static get api() {
        const reti = Medirec.#api;
        return reti;
    }
}

document.addEventListener("DOMContentLoaded", () => Medirec.main());
