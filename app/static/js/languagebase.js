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
 * Class, which represents base of phrases of all languages.
 */
class LanguageBase{

    /**
     * Listeners, which are called, when the language is changed.
     */
    static #changeListeners = [];

    /**
     * Name of the cookie, which stores the current language of the application.
     */
    static COOKIE_NAME = "locale";

    /**
     * Default language of the application.
     */
    static DEFAULT_LANGUAGE = "en";

    /**
     * Gets current language of the application.
     * @returns {string} Code of the current language of the application.
     */
    static get currentLanguage(){
        let reti = LanguageBase.DEFAULT_LANGUAGE;
        const getCookieValue = (name) => (
        document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
        );
        const cookieValue = getCookieValue(LanguageBase.COOKIE_NAME);
        if(cookieValue !== ""){
            reti = cookieValue;
        }
        else{
            let browserLanguage = navigator.language || navigator.userLanguage;
            if(browserLanguage !== undefined && browserLanguage !== null && browserLanguage !== ""){
                reti = browserLanguage;
            }
        }
        return reti;
    }

    /**
     * Sets current language of the application.
     * @param {string} value Code of the current language of the application.
     */
    static set currentLanguage(value){
        document.cookie = LanguageBase.COOKIE_NAME + "=" + value + "; path=/";
        if(LanguageBase.#changeListeners !== undefined && LanguageBase.#changeListeners !== null){
            for(let listener of LanguageBase.#changeListeners){
                listener(value);
            }
        }
    }

    /**
     * Adds listener, which is called, when the language is changed.
     * @param {function(string)} listener Listener, which is called, when the language is changed.
     */
    static addChangeListener(listener){
        if(LanguageBase.#changeListeners !== undefined && LanguageBase.#changeListeners !== null){
            LanguageBase.#changeListeners.push(listener);
        }
    }

    /**
     * Translates a phrase to the current language.
     * @param {string} phrase Phrase to translate.
     * @returns {string} Translated phrase.
     */
    static translate(phrase){
        let reti = phrase;
        let currentLanguage = LanguageBase.currentLanguage;
        //TODO: Proper translation implementation
        reti = phrase + " (" + currentLanguage + ")";
        return reti;
    }

}