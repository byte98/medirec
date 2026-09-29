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
 * Class, which wraps all UI elements and interactions.
 */
class UI{

    /**
     * Container, in which all dialogs are placed.
     * @type {HTMLElement}
     * @private
     */
    #dialogsContainer;

    /**
     * Number of dialogs, which are currently opened.
     * @type {number}
     * @private
     */
    #dialogsOpen;

    /**
     * Main preloader, which is displayed during loading of the application.
     * @type {HTMLElement}
     * @private
     */
    #preloader;
     
    
    /**
     * Main content of the application.
     */
    #content;

    /**
     * Creates new wrapper for UI elements and interactions.
     * @param {HTMLElement} dialogsContainer Container, in which all dialogs are placed.
     * @param {HTMLElement} preloader Main preloader, which is displayed during loading of the application.
     * @param {HTMLElement} content Main content of the application.
     */
    constructor(dialogsContainer, preloader, content){
        this.#dialogsContainer = dialogsContainer;
        this.#dialogsOpen = 0;
        this.#preloader = preloader;
        this.#content = content;
    }

    /**
     * Shows dialog box with given parameters.
     * @param {"error"|"info"|"question"|"success"|"warning"} type Type of the dialog.
     * @param {string} header Header of the dialog.
     * @param {string} body Body of the dialog.
     * @param {string} details Details of the dialog. If empty, the details will not be shown.
     * @param {Array<Array<Function|string|string>>} actions Actions to be displayed in the dialog. First element of the array is the callback function, second is the text of the button and third is the icon of the button (as of name of Ionicons icon). If empty, no actions will be shown.
     * @param {boolean} closeable Whether the dialog is closeable.
     * @param {number} autoClose Time in milliseconds after which the dialog will be automatically closed. If 0, the dialog will not be automatically closed.
     */
    showDialog(
        type,
        header,
        body,
        details="",
        actions = [[]],
        closeable = false,
        autoClose = 0
    )
    {
        const dialog = new Dialog(type, header, body, details, closeable, autoClose);
        for (const action of actions){
            if (action.length >= 2){
                const callback = action[0];
                const text = action[1];
                const icon = (action.length >= 3) ? action[2] : "";
                dialog.addAction(callback, text, icon);
            }
        }
        dialog.onShow(() => {
            this.#dialogsOpen += 1;
        });
        dialog.onClose(() => {
            this.#dialogsOpen -= 1;
            if (this.#dialogsOpen <= 0){
                this.#dialogsOpen = 0;
                this.#dialogsContainer.classList.add("hidden");
            }
        });
        this.#dialogsContainer.classList.remove("hidden");
        dialog.showDialog(this.#dialogsContainer);
    }

    /**
     * Shows the main content of the application.
     */
    showContent(){
        this.#content.classList.remove("hidden");
    }

    /**
     * Hides the main content of the application.
     */
    hideContent(){
        this.#content.classList.add("hidden");
    }

    /**
     * Shows the main preloader of the application.
     */
    showPreloader(){
        this.#preloader.classList.remove("hidden");
    }

    /**
     * Hides the main preloader of the application.
     */
    hidePreloader(){
        this.#preloader.classList.add("hidden");
    }
}