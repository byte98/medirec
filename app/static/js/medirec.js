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
 * Class, which just wraps main script of the application.
 */
class Medirec{

    /**
     * Language switcher of the application.
     * @type {LanguageSwitch}
     * @private
     */
    static #languageSwitch = new LanguageSwitch(
        document.querySelectorAll(".language-switch")
    );

    /**
     * UI of the application.
     * @type {UI}
     * @private
     */
    static #ui = new UI(
        document.querySelector("#dialogs"),
        document.querySelector("#title"),
        document.querySelector("main"),
        document.querySelector("#wait")
    );

    /**
     * API wrapper of the application.
     * @type {API}
     * @private
     */
    static #api = new API("/api", 8000);

    /**
     * Main function of the script.
     */
    static main(){
        Medirec.#ui.lockLoader();

        // Handle click on "menu" button in mobile view
        const mobileMenuButtons = document.querySelectorAll(".menu-button");
        for(const menuButton of mobileMenuButtons){
            menuButton.addEventListener("click", () => {
                const items = document.querySelectorAll("nav > ul >li:not(.mobile-only)");
                for(const item of items){
                    item.classList.toggle("not-mobile");
                }
                const chevrons = menuButton.querySelectorAll(".chevron");
                for(const chevron of chevrons){
                    chevron.classList.toggle("hidden");
                }
            });
        }

        // Handle menu navigation
        const menuButtons = document.querySelectorAll("nav > ul > li > button");
        for(const button of menuButtons){
            if (button.hasAttribute("data-target")){
                button.addEventListener("click", () => {
                    const target = button.getAttribute("data-target");
                    if(target !== null && target !== undefined){
                        const items = document.querySelectorAll("nav > ul >li:not(.mobile-only)");
                        for(const item of items){
                            item.classList.toggle("not-mobile");
                        }
                        const mobileMenuButtons = document.querySelectorAll(".menu-button");
                        for(const menuButton of mobileMenuButtons){
                            const chevrons = menuButton.querySelectorAll(".chevron");
                            for(const chevron of chevrons){
                                chevron.classList.toggle("hidden");
                            }
                        }
                        window.location.hash = target;
                    }
                });
            }
        }

    };

    /**
     * Loads all languages, which are available in the application.
     */
    static loadLanguages(){
        // Make language switch working
        Medirec.#languageSwitch.clearLanguages();
        Medirec.#languageSwitch.addSelectedLanguageChangedListener((languageMeta) => {
            LanguageBase.currentLanguage = languageMeta.code;
        });
        Medirec.#api.loadLanguageMeta(
            (languageMetaList) => {
                for(const languageMeta of languageMetaList){
                    Medirec.#languageSwitch.addLanguage(languageMeta);
                }
                const currentLanguage = LanguageBase.currentLanguage;
                Medirec.#api.getLanguageMeta(currentLanguage,
                    (languageMeta) => {
                        // TODO: Perform translation...
                        Medirec.#languageSwitch.setSelectedLanguage(languageMeta);
                        Medirec.#ui.forceUnlockLoader();
                        Medirec.#ui.hidePreloader();
                        Medirec.#ui.showContent();
                    },
                    (error) => {
                        Medirec.#ui.forceUnlockLoader();
                        Medirec.#ui.hideContent();
                        Medirec.#ui.showPreloader();
                        Medirec.#ui.hidePreloaderAnimation();
                        Medirec.#ui.showDialog(
                            "error",
                            "Start of the application failed!",
                            "Application couldn't start - unknown language found.\nTry it again later, please.\nIf the problem persists, please contact the administrator.",
                            error,
                            [
                                [
                                    () => {window.location.reload();},
                                    "Try again",
                                    "refresh-sharp"
                                ]
                            ],
                            true,
                            0
                        );
                    }
                );
            },
            (error) => {
                Medirec.#ui.unlockLoader();
                Medirec.#ui.hideContent();
                Medirec.#ui.showPreloader();
                Medirec.#ui.hidePreloaderAnimation();
                Medirec.#ui.showDialog(
                    "error",
                    "Start of the application failed!",
                    "Application couldn't start - loading languages failed.\nTry it again later, please.\nIf the problem persists, please contact the administrator.",
                    error,
                    [
                        [
                            () => {window.location.reload();},
                            "Try again",
                            "refresh-sharp"
                        ]
                    ],
                    true,
                    0
                );
            }
        );
    }

    /**
     * Gets the language switcher of the application.
     * @returns {LanguageSwitch} Language switcher of the application.
     */
    static get languageSwitch(){
        return Medirec.#languageSwitch;
    }

    /**
     * Gets the UI of the application.
     * @returns {UI} UI of the application.
     */
    static get ui(){
        return Medirec.#ui;
    }

    /**
     * Gets the API wrapper of the application.
     * @returns {API} API wrapper of the application.
     */
    static get api(){
        return Medirec.#api;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Medirec.main();
});