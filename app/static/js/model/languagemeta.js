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
 * Class, which represents metadata of the language.
 */
class LanguageMeta{
    
    /**
     * Code of the language.
     * @type {string}
     * @private
     */
    #code;
    
    /**
     * Name of the language.
     * @type {string}
     * @private
     */
    #name;

    /**
     * Native name of the language.
     * @type {string}
     * @private
     */
    #nativeName;

    /**
     * Version of the language metadata.
     * @type {string}
     * @private
     */
    #version;

    /**
     * Path to the flag representing the language.
     * @type {string}
     * @private
     */
    #flag;

    /**
     * Creates new metadata for the language.
     * @param {string} code Code of the language.
     * @param {string} name Name of the language.
     * @param {string} nativeName Native name of the language.
     * @param {string} version Version of the language metadata.
     * @param {string} flag Path to the flag representing the language.
     */
    constructor(code, name, nativeName, version, flag){
        this.#code = code;
        this.#name = name;
        this.#nativeName = nativeName;
        this.#version = version;
        this.#flag = flag;
    }

    /**
     * Gets the code of the language.
     * @returns {string} Code of the language.
     */
    get code(){
        return this.#code;
    }

    /**
     * Gets the name of the language.
     * @returns {string} Name of the language.
     */
    get name(){
        return this.#name;
    }

    /**
     * Gets the native name of the language.
     * @returns {string} Native name of the language.
     */
    get nativeName(){
        return this.#nativeName;
    }

    /**
     * Gets the version of the language metadata.
     * @returns {string} Version of the language metadata.
     */
    get version(){
        return this.#version;
    }

    /**
     * Gets the flag representing the language.
     * @returns {string} Path to the flag representing the language.
     */
    get flag(){
        return this.#flag;
    }
}