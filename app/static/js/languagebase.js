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

/** Client-side translation cache and translator. */
class LanguageBase {
    /** @type {string} */ static COOKIE_NAME = 'locale';
    /** @type {string} */ static PARAMETER_NAME = 'lang';
    /** @type {string} */ static DEFAULT_LANGUAGE = 'en';
    /** @type {object} */ static #languages = {};
    /** @type {string} */ static #current = 'en';
    /** @type {function[]} */ static #listeners = [];

    /**
     * Determine preferred language.
     * @returns {string} Language code.
     */
    static get currentLanguage() {
        let reti = LanguageBase.DEFAULT_LANGUAGE;
        const parameter = new URLSearchParams(window.location.search).get(LanguageBase.PARAMETER_NAME);
        const cookie = document.cookie.match('(^|;)\\s*' + LanguageBase.COOKIE_NAME + '\\s*=\\s*([^;]+)')?.pop() || '';
        const browser = navigator.language || navigator.userLanguage || '';
        const candidate = parameter || cookie || browser;
        if (candidate) {
            reti = candidate.split('-')[0];
        }
        if (!LanguageBase.#languages[reti]) {
            reti = LanguageBase.DEFAULT_LANGUAGE;
        }
        return reti;
    }

    /** @param {string} value Language code. */
    static set currentLanguage(value) {
        LanguageBase.#current = value;
        document.cookie = `${LanguageBase.COOKIE_NAME}=${value}; path=/; SameSite=Lax`;
        for (const listener of LanguageBase.#listeners) { listener(value); }
    }

    /** @param {object[]} languages Cached language resources. */
    static set languages(languages) {
        LanguageBase.#languages = {};
        for (const language of languages) { LanguageBase.#languages[language.code] = language; }
    }

    /** @returns {object} Current language resource. */
    static get language() {
        const code = LanguageBase.#languages[LanguageBase.#current] ? LanguageBase.#current : LanguageBase.currentLanguage;
        const reti = LanguageBase.#languages[code] || {};
        return reti;
    }

    /** @param {function} listener Language change listener. */
    static addChangeListener(listener) { LanguageBase.#listeners.push(listener); }

    /** @param {string} phrase Phrase key. @returns {string} Translation. */
    static translate(phrase) {
        const phrases = LanguageBase.language.phrases || {};
        const reti = phrases[phrase] || phrase;
        return reti;
    }

    /** Apply current translations to the document. */
    static apply() {
        for (const element of document.querySelectorAll('[data-phrase]')) {
            element.textContent = LanguageBase.translate(element.dataset.phrase);
        }
        for (const element of document.querySelectorAll('[data-phrase-placeholder]')) {
            element.setAttribute('placeholder', LanguageBase.translate(element.dataset.phrasePlaceholder));
        }
        document.documentElement.lang = LanguageBase.#current;
        document.title = LanguageBase.translate('medical_records');
    }

    /** @returns {object[]} Loaded language resources. */
    static get languages() { const reti = Object.values(LanguageBase.#languages); return reti; }

    /** @returns {string} Current language code. */
    static get code() { const reti = LanguageBase.#current; return reti; }
}
