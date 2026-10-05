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
 * Class, which represents health insurance company.
 */
class HealthInsuranceCompany{

    /**
     * Code of the health insurance company.
     * @type {string}
     * @private
     */
    #code;

    /**
     * Abbreviation of the health insurance company.
     * @type {string}
     * @private
     */
    #abbreviation;

    /**
     * Name of the health insurance company.
     * @type {string}
     * @private
     */
    #name;

    /**
     * Note of the health insurance company.
     * @type {string}
     * @private
     */
    #note;

    /**
     * Creates a new health insurance company.
     * @param {string} code Code of the health insurance company.
     * @param {string} abbreviation Abbreviation of the health insurance company.
     * @param {string} name Name of the health insurance company.
     * @param {string} note Note of the health insurance company.
     */
    constructor(code, abbreviation, name, note){
        this.#code = code;
        this.#abbreviation = abbreviation;
        this.#name = name;
        this.#note = note;
    }

    /**
     * Gets the code of the health insurance company.
     * @returns {string} Code of the health insurance company.
     */
    get code(){
        return this.#code;
    }

    /**
     * Gets the abbreviation of the health insurance company.
     * @returns {string} Abbreviation of the health insurance company.
     */
    get abbreviation(){
        return this.#abbreviation;
    }

    /**
     * Gets the name of the health insurance company.
     * @returns {string} Name of the health insurance company.
     */
    get name(){
        return this.#name;
    }

    /**
     * Gets the note of the health insurance company.
     * @returns {string} Note of the health insurance company.
     */
    get note(){
        return this.#note;
    }
}