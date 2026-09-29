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
 * Class representing a dialog box.
 */
class Dialog{
    /**
     * Element, which contains the dialog box.
     * @type {HTMLElement}
     * @private
     */
    #element;

    /**
     * Sound, which is played when the dialog box is shown.
     * @type {Audio}
     * @private
     */
    #sound;

    /**
     * Timer, which is used to automatically close the dialog box.
     * @type {number}
     * @private
     */
    #autoCloseTimer;

    /**
     * Time in miliseconds after which the dialog box will be automatically closed. If 0, the dialog box will not be automatically closed.
     * @type {number}
     * @private
     */
    #autoClose;

    /**
     * Container, where the dialog box will be shown.
     * @type {HTMLElement}
     * @private
     */
    #container;

    /**
     * Event listeners, which are called when the dialog box is closed.
     * @type {Array<function>}
     * @private
     */
    #onCloseEventListeners;

    /**
     * Event listeners, which are called when the dialog box is shown.
     * @type {Array<function>}
     * @private
     */
    #onShowEventListeners;

    /**
     * Number of actions, which are added to the dialog box.
     * @type {number}
     * @private
     */
    #defaultActions;

    /**
     * Sounds, which are played when the dialog box is shown.
     * @type {Object}
     * @private
     */
    static #sounds = {
        "error": new Audio("../mp3/error.mp3"),
        "info": new Audio("../mp3/info.mp3"),
        "question": new Audio("../mp3/question.mp3"),
        "success": new Audio("../mp3/success.mp3"),
        "warning": new Audio("../mp3/warning.mp3")
    };

    /**
     * Icons, which are used in the dialog box.
     * @type {Object}
     * @private
     */
    static #icons = {
        "error": () => {const reti = document.createElement("ion-icon"); reti.setAttribute("name", "close-circle-outline"); return reti;},
        "info": () => {const reti = document.createElement("ion-icon"); reti.setAttribute("name", "information-circle-outline"); return reti;},
        "question": () => {const reti = document.createElement("ion-icon"); reti.setAttribute("name", "help-circle-outline"); return reti;},
        "success": () => {const reti = document.createElement("ion-icon"); reti.setAttribute("name", "checkmark-circle-outline"); return reti;},
        "warning": () => {const reti = document.createElement("ion-icon"); reti.setAttribute("name", "warning-outline"); return reti;}
    };

    /**
     * Details button, which is used to show/hide the details of the dialog box.
     * @type {function}
     * @private
     * @returns {HTMLElement} Details button. 
     */
    #detailsButton = () => {
        const reti = document.createElement("button");
        reti.classList.add("dialog-details-button");
        reti.appendChild(document.createTextNode("Details"));
        const caretDown = document.createElement("ion-icon");
        caretDown.setAttribute("name", "caret-down-sharp");
        reti.appendChild(caretDown);
        const caretUp = document.createElement("ion-icon");
        caretUp.setAttribute("name", "caret-up-sharp");
        caretUp.classList.add("hidden");
        reti.appendChild(caretUp);
        reti.addEventListener("click", (event) => {
            const details = this.#element.querySelector(".dialog-details");
            if(details !== null){
                details.classList.toggle("hidden");
                caretDown.classList.toggle("hidden");
                caretUp.classList.toggle("hidden");
            }
        });
        return reti;
    };

    /**
     * Creates a close button, which is used to close the dialog box.
     * @type {function}
     * @private
     * @returns {HTMLElement} Close button. 
     */
    #closeButton = () => {
        const reti = document.createElement("button");
        const icon = document.createElement("ion-icon");
        icon.setAttribute("name", "close-outline");
        reti.appendChild(icon);
        reti.appendChild(document.createTextNode("Close"));
        reti.addEventListener("click", (event) => {
            this.closeDialog();
        });
        return reti;
    }

    /**
     * Creates a new dialog box.
     * @param {"error"|"info"|"question"|"success"|"warning"} type Type of the dialog box.
     * @param {string} header Header of the dialog box.
     * @param {string} body Body of the dialog box.
     * @param {string} details Details of the dialog box. If empty, the details will not be shown.
     * @param {boolean} closeable Whether the dialog box is closeable.
     * @param {number} autoClose Time in miliseconds after which the dialog box will be automatically closed. If 0, the dialog box will not be automatically closed.
     */
    constructor(type, header, body, details = "", closeable = false, autoClose = 0){
        this.#autoClose = autoClose;
        this.#onCloseEventListeners = [];
        this.#onShowEventListeners = [];
        this.#defaultActions = 0;
        this.#element = document.createElement("div");
        this.#element.classList.add("dialog");
        this.#element.classList.add(`dialog-${type}`);
        const iconSpan = document.createElement("span");
        iconSpan.classList.add("dialog-icon");
        iconSpan.appendChild(Dialog.#icons[type]());
        this.#element.appendChild(iconSpan);
        const headerSpan = document.createElement("span");
        headerSpan.classList.add("dialog-header");
        headerSpan.innerText = header;
        this.#element.appendChild(headerSpan);
        const bodySpan = document.createElement("span");
        bodySpan.classList.add("dialog-body");
        bodySpan.innerText = body;
        this.#element.appendChild(bodySpan);
        const actionsSpan = document.createElement("span");
        actionsSpan.classList.add("dialog-actions");
        this.#element.appendChild(actionsSpan);
        if (closeable){
            actionsSpan.appendChild(this.#closeButton());
            this.#defaultActions += 1;
        }
        if(details !== ""){
            actionsSpan.appendChild(this.#detailsButton());
            const detailsSpan = document.createElement("span");
            detailsSpan.classList.add("dialog-details");
            detailsSpan.classList.add("hidden");
            detailsSpan.innerText = details;
            this.#element.appendChild(detailsSpan);
            this.#defaultActions += 1;
        }
        this.#sound = Dialog.#sounds[type];
    }

    /**
     * Adds an action to the dialog box.
     * @param {function} callback The callback function to be called when the action is triggered.
     * @param {string} text The text to be displayed on the action button.
     * @param {string} icon The icon to be displayed on the action button. This is expected to be the name of the icon in the Ionicons library. If empty, no icon will be displayed.
     */
    addAction(callback, text, icon = ""){
        const button = document.createElement("button");
        if (icon !== ""){
            const iconElement = document.createElement("ion-icon");
            iconElement.setAttribute("name", icon);
            button.appendChild(iconElement);
        }
        button.appendChild(document.createTextNode(text));
        button.classList.add("dialog-action");
        button.addEventListener("click", (event) => {
            callback();
        });
        const actionsSpan = this.#element.querySelector(".dialog-actions");
        if (actionsSpan !== null){
            const existingActions = actionsSpan.children;
            const lastDefaultAction = (existingActions.length > 0) ? existingActions[existingActions.length - this.#defaultActions] : null;
            if (lastDefaultAction !== null){
                actionsSpan.insertBefore(button, lastDefaultAction);
            } else {
                actionsSpan.appendChild(button);
            }
        }
    }

    /**
     * Adds a callback function to be called when the dialog box is closed.
     * @param {function} callback The callback function to be called.
     */
    onClose(callback){
        this.#onCloseEventListeners.push(callback);
    }

    /**
     * Adds a callback function to be called when the dialog box is shown.
     * @param {function} callback The callback function to be called.
     */
    onShow(callback){
        this.#onShowEventListeners.push(callback);
    }

    /**
     * Shows the dialog box.
     * @param {HTMLElement} container Container, where the dialog box will be shown.
     */
    showDialog(container){
        this.#container = container;
        container.appendChild(this.#element);
        this.#element.scrollIntoView({behavior: "smooth", block: "center"});
        this.#sound.play();
        if (this.#autoClose > 0){
            this.#autoCloseTimer = setTimeout(() => {
                this.closeDialog();
            }, this.#autoClose);
        }
        for (const callback of this.#onShowEventListeners){
            callback();
        }
    }

    /**
     * Closes the dialog box.
     */
    closeDialog(){
        if (this.#container !== undefined && this.#element !== undefined && this.#container.contains(this.#element)){
            this.#container.removeChild(this.#element);
        }
        if (this.#autoCloseTimer !== undefined){
            clearTimeout(this.#autoCloseTimer);
        }
        for (const callback of this.#onCloseEventListeners){
            callback();
        }
    }
}