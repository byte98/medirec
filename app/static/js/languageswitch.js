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
 * Class wrapping the language switcher used by every MediRec section.
 */
class LanguageSwitch {
    /**
     * Create a language switcher.
     * @param {NodeListOf<HTMLElement>} buttons Language-switch buttons.
     */
    constructor(buttons) {
        this.#buttons = buttons;
        this.#languages = [];
        this.#selectedIndex = -1;

        for (const button of this.#buttons) {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.#toggleMenu(button);
            });

            const closeButton = button.parentElement?.querySelector(".language-close");
            if (closeButton !== null && closeButton !== undefined) {
                closeButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.#hideMenu();
                });
            }
        }

        for (const closeButton of document.querySelectorAll(".language-close")) {
            closeButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.#hideMenu();
            });
        }

        window.addEventListener("hashchange", () => {
            this.#hideMenu();
        });
    }

    /** @type {NodeListOf<HTMLElement>} @private */
    #buttons;

    /** @type {object[]} @private */
    #languages;

    /** @type {number} @private */
    #selectedIndex;

    /**
     * Hide all language menus and reset their chevrons.
     */
    #hideMenu() {
        for (const button of this.#buttons) {
            const menu = button.parentElement?.querySelector(".language-menu");
            if (menu !== null && menu !== undefined) {
                menu.classList.add("hidden");
            }

            for (const chevron of button.querySelectorAll("ion-icon[name='chevron-up-sharp']")) {
                chevron.classList.add("hidden");
            }
            for (const chevron of button.querySelectorAll("ion-icon[name='chevron-down-sharp']")) {
                chevron.classList.remove("hidden");
            }
        }
    }

    /**
     * Toggle the menu belonging to one language switch button.
     * @param {HTMLElement} button Language switch button.
     */
    #toggleMenu(button) {
        const menu = button.parentElement?.querySelector(".language-menu");
        const isHidden = menu?.classList.contains("hidden") ?? true;
        this.#hideMenu();

        if (menu !== null && menu !== undefined) {
            menu.classList.toggle("hidden", !isHidden);
        }
        for (const chevron of button.querySelectorAll("ion-icon[name='chevron-down-sharp']")) {
            chevron.classList.toggle("hidden", !isHidden);
        }
        for (const chevron of button.querySelectorAll("ion-icon[name='chevron-up-sharp']")) {
            chevron.classList.toggle("hidden", isHidden);
        }
    }

    /**
     * Set available languages.
     * @param {object[]} languages Language metadata.
     */
    setLanguages(languages) {
        this.#languages = languages;
        const currentCode = LanguageBase.currentLanguage;
        const index = languages.findIndex((language) => language.code === currentCode);
        this.#selectedIndex = index >= 0 ? index : 0;
        this.#updateButton();
    }

    /**
     * Select a language by code.
     * @param {string} code Language code.
     */
    select(code) {
        const index = this.#languages.findIndex((language) => language.code === code);
        if (index >= 0) {
            this.#selectedIndex = index;
            LanguageBase.currentLanguage = this.#languages[index].code;
            LanguageBase.apply();
            this.#updateButton();
            this.#hideMenu();
        }
    }

    /**
     * Initialize the selected language.
     * @param {string} code Language code.
     */
    initialize(code) {
        this.select(code);
    }

    /**
     * Update every language button and recreate every language menu.
     */
    #updateButton() {
        for (const button of this.#buttons) {
            const menu = button.parentElement?.querySelector(".language-menu");
            if (menu === null || menu === undefined) {
                continue;
            }

            const selected = this.#languages[this.#selectedIndex];
            const flag = button.querySelector("img[data-item='lang_flag']");
            const name = button.querySelector("span[data-item='lang_native']");

            if (selected !== undefined) {
                if (flag !== null) {
                    flag.src = selected.flag;
                    flag.alt = selected.nativeName;
                }
                if (name !== null) {
                    name.textContent = selected.nativeName;
                }
            }

            const existing = menu.querySelector("ul");
            if (existing !== null) {
                existing.remove();
            }

            const list = document.createElement("ul");
            for (const language of this.#languages) {
                const item = document.createElement("li");
                if (selected === language) {
                    item.classList.add("selected");
                }

                const image = document.createElement("img");
                image.src = language.flag;
                image.alt = language.nativeName;
                item.appendChild(image);

                const text = document.createElement("span");
                text.textContent = language.nativeName;
                item.appendChild(text);

                item.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.select(language.code);
                });
                list.appendChild(item);
            }
            menu.appendChild(list);
        }
    }
}
