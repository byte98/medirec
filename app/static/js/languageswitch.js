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
 * Class, which just wraps language switcher of the application.
 */
class LanguageSwitch{
    
    /**
     * Buttons, which is used to switch the language of the application.
     * @type {NodeList}
     */
    #buttons;

    /**
     * List of all languages, which are available in the application.
     * @type {LanguageMeta[]}
     */
    #languages;

    /**
     * Index of the selected language in the list of all languages, which are available in the application.
     * @type {number}
     * @private
     */
    #selectedIndex;

    /**
     * Listeners, which are called when the selected language is changed.
     * @type {function(LanguageMeta)[]}
     * @private
     */
    #selectedLanguageChangedListeners;

    /**
     * Creates new language switcher.
     * @param {NodeList} buttons Buttons, which are used to switch the language of the application.
     */
    constructor(buttons){
        this.#buttons = buttons;
        this.#selectedLanguageChangedListeners = [];
        for(const button of this.#buttons){
            button.addEventListener("click", () => {
                this.#toggleMenu();
            });
        }
        this.#languages = [];
        this.#selectedIndex = -1;
        for(const button of this.#buttons){
            const closeButton = button.parentElement.querySelector("button.mobile-only");
            if(closeButton !== null && closeButton !== undefined){
                closeButton.addEventListener("click", () => {
                    this.#hideMenu();
                });
            }
        }

        // Close all menus on navigation
        window.addEventListener("hashchange", (event) => {
            this.#hideMenu();
        });
    }
    
    /**
     * Hides the menu of the language switcher.
     * @private
     * @returns {void}
     */
    #hideMenu(){
        for(const button of this.#buttons){
            const menu = button.parentElement.querySelector(".language-menu");
            if(menu !== null && menu !== undefined){
                menu.classList.add("hidden");
            }
            const chevronUps = button.querySelectorAll("ion-icon[name='caret-up-sharp']");
            for(const chevron of chevronUps){
                chevron.classList.add("hidden");
            }
            const chevronDowns = button.querySelectorAll("ion-icon[name='caret-down-sharp']");
            for(const chevron of chevronDowns){
                chevron.classList.remove("hidden");
            }
        }
    }

    /**
     * Toggles the menu of the language switcher.
     * @private
     * @returns {void}
     */
    #toggleMenu(){
        for(const button of this.#buttons){
            const menu = button.parentElement.querySelector(".language-menu");
            if(menu !== null && menu !== undefined){
                menu.classList.toggle("hidden");
            }
            const chevrons = button.querySelectorAll("ion-icon");
            for(const chevron of chevrons){
                chevron.classList.toggle("hidden");
            }
        }
    }

    /**
     * Adds a listener that will be called when the selected language is changed.
     * @param {function(LanguageMeta)} listener The listener to add.
     */
    addSelectedLanguageChangedListener(listener){
        if(typeof listener === "function"){
            this.#selectedLanguageChangedListeners.push(listener);
        }
    }

    /**
     * Adds a new language to the list of available languages.
     * @param {LanguageMeta} languageMeta Metadata of the language, which is added to the list of available languages.
     */
    addLanguage(languageMeta){
        this.#languages.push(languageMeta);
        this.#updateButton();
    }

    /**
     * Sets the selected language.
     * @param {LanguageMeta} language Language, which is selected in the language switcher.
     */
    setSelectedLanguage(language){
        let index = this.#languages.indexOf(language);
        if(index !== -1){
            this.#selectedIndex = index;
            this.#updateButton();
        }
    }

    /**
     * Invokes all listeners, which are called when the selected language is changed.
     * @private
     * @returns {void}
     */
    #invokeListeners(){
        if(this.#selectedIndex !== -1 && this.#selectedIndex < this.#languages.length){
            const language = this.#languages[this.#selectedIndex];
            for(const listener of this.#selectedLanguageChangedListeners){
                listener(language);
            }
        }
    }

    /**
     * Updates the button, which is used to switch the language of the application.
     * @private
     * @returns {void}
     */
    #updateButton(){
        for(const button of this.#buttons){
            const menu = button.parentElement.querySelector(".language-menu");
            const flag = button.querySelector("img[data-item='lang_flag']");
            const name = button.querySelector("span[data-item='lang_native']");
            if(this.#selectedIndex !== -1 && this.#selectedIndex < this.#languages.length){
                const language = this.#languages[this.#selectedIndex];
                if(flag !== null && flag !== undefined){
                    flag.src = language.flag
                    flag.alt = language.nativeName;
                }
                if(name !== null && name !== undefined){
                    name.textContent = language.nativeName;
                }
            }
            const existingUl = menu.querySelector("ul");
            if(existingUl !== null && existingUl !== undefined){
                existingUl.remove();
            }
            const ul = document.createElement("ul");
            for(const lang of this.#languages){
                const li = document.createElement("li");
                if (this.#selectedIndex !== -1 && this.#selectedIndex < this.#languages.length && this.#languages[this.#selectedIndex] === lang){
                    li.classList.add("selected");
                }
                const flag = document.createElement("img");
                flag.src = lang.flag;
                flag.alt = lang.nativeName;
                li.appendChild(flag);
                const span = document.createElement("span");
                span.textContent = lang.nativeName;
                li.appendChild(span);
                li.addEventListener("click", () => {
                    this.#selectedIndex = this.#languages.indexOf(lang);
                    this.#updateButton();
                    this.#invokeListeners();
                    this.#hideMenu();
                });
                ul.appendChild(li);
            }
            menu.appendChild(ul);
        }
    }

    /**
     * Clears the list of available languages and resets the selected language.
     * @returns {void}
     */
    clearLanguages(){
        this.#languages = [];
        this.#selectedIndex = -1;
        this.#updateButton();
    }
}