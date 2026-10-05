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
 * Class, which wraps all API calls.
 */
class API{

    /**
     * Time in milliseconds after which the API call will be considered as timeout.
     * @type {number}
     * @private
     */
    #timeout;

    /**
     * Endpoint of the API.
     * @type {string}
     * @private
     */
    #endpoint;

    /**
     * Creates new wrapper for API calls.
     * @param {string} endpoint Endpoint of the API.
     * @param {number} timeout Time in milliseconds after which the API call will be considered as timeout.
     */
    constructor(endpoint, timeout=8000){
        this.#endpoint = endpoint;
        this.#timeout = timeout;
    }


    /**
     * Fetches language metadata from the API.
     * @param {function(LanguageMeta[])} onSuccess The callback function to call with the fetched metadata.
     * @param {function(string)} onError The callback function to call with the error message in case of failure.
     */
    fetchLanguageMeta(onSuccess, onError){
        let timedOut = false;
        const fetchPoint = `${this.#endpoint}/languages`;
        const startTime = new Date(Date.now());
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            onError(startTime.toISOString() + " Fetching language metadata ('" + fetchPoint + "') ...\n" + new Date(Date.now()).toISOString() + " ERROR: Request took too long (max. allowed time: " + this.#timeout + " ms) - TIMEOUT!");
        }, this.#timeout);

        // TODO: Implement real API call
        Debug.fetchLanguageMetadata((data) => {
            if (timedOut == false){
                window.clearTimeout(timeoutId);
                onSuccess(data);
            }
        });
    }

    /**
     * Saves language metadata to the IndexedDB database.
     * @param {LanguageMeta} meta The language metadata to save.
     * @param {function()} onSuccess The callback function to call on success.
     * @param {function(string)} onError The callback function to call on error.
     */
    saveLanguageMeta(meta, onSuccess, onError){
        let timedOut = false;
        const startTime = new Date(Date.now());
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            onError(startTime.toISOString() + " Saving language metadata ...\n" + new Date(Date.now()).toISOString() + " ERROR: Call took too long (max. allowed time: " + this.#timeout + " ms) - TIMEOUT!");
        }, this.#timeout);

        // TODO: Implement saving to IndexedDB
        Debug.saveLanguageMetadata(meta, () => {
            if (timedOut == false){
                window.clearTimeout(timeoutId);
                onSuccess();
            }
        });
    }

    /**
     * Saves multiple language metadatas to the IndexedDB database.
     * @param {LanguageMeta[]} metas Metadatas of the languages to save.
     * @param {function()} onSuccess The callback function to call on success.
     * @param {function(string)} onError The callback function to call on error.
     */
    saveLanguageMetas(metas, onSuccess, onError){
        let timedOut = false;
        const startTime = new Date(Date.now());
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            onError(startTime.toISOString() + " Saving multiple (" + metas.length + ") language metadata ...\n" + new Date(Date.now()).toISOString() + " ERROR: Call took too long (max. allowed time: " + this.#timeout + " ms) - TIMEOUT!");
        }, this.#timeout);

        // TODO: Implement saving to IndexedDB
        Debug.saveLanguageMetas(metas, () => {
            if (timedOut == false){
                window.clearTimeout(timeoutId);
                onSuccess();
            }
        });
    }

    /**
     * Obtains language metadata from the IndexedDB database.
     * @param {string} code The code of the language to obtain.
     * @param {function(LanguageMeta)} onSuccess The callback function to call with the obtained metadata.
     * @param {function(string)} onError The callback function to call with the error message in case of failure.
     */
    getLanguageMeta(code, onSuccess, onError){
        let timedOut = false;
        const startTime = new Date(Date.now());
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            onError(startTime.toISOString() + " Obtaining language metadata for code '" + code + "' ...\n" + new Date(Date.now()).toISOString() + " ERROR: Call took too long (max. allowed time: " + this.#timeout + " ms) - TIMEOUT!");
        }, this.#timeout);

        // TODO: Implement real API call
        Debug.getLanguageMetadata(code, (data) => {
            if (timedOut == false){
                window.clearTimeout(timeoutId);
                if (data === null){
                    onError(startTime.toISOString() + " Obtaining language metadata for code '" + code + "' ...\n" + new Date(Date.now()).toISOString() + " ERROR: Language metadata not found!");
                }
                else {
                    onSuccess(data);
                }
            }
        });
    }

    /**
     * Loads language metadata from the IndexedDB database.
     * @param {function(LanguageMeta[])} onSuccess The callback function to call with the loaded metadata.
     * @param {function(string)} onError The callback function to call with the error message in case of failure.
     */
    loadLanguageMeta(onSuccess, onError){
        let timedOut = false;
        const startTime = new Date(Date.now());
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            onError(startTime.toISOString() + " Loading language metadata ...\n" + new Date(Date.now()).toISOString() + " ERROR: Call took too long (max. allowed time: " + this.#timeout + " ms) - TIMEOUT!");
        }, this.#timeout);

        // TODO: Implement real API call
        Debug.loadLanguageMetadata((data) => {
            if (timedOut == false){
                window.clearTimeout(timeoutId);
                onSuccess(data);
            }
        });
    }

    /**
     * Creates a new HIC (Health Insurance Company) in the system.
     * @param {HealthInsuranceCompany} hic The HIC data to create.
     * @param {function()} onSuccess The callback function to call on success.
     * @param {function(string[])} onWarning The callback function to call on warning (ie. data are not valid).
     * @param {function(string)} onError The callback function to call on error.
     */
    createHIC(hic, onSuccess, onWarning, onError){
        let timedOut = false;
        const startTime = new Date(Date.now());
        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            onError(startTime.toISOString() + " Creating new HIC ...\n" + new Date(Date.now()).toISOString() + " ERROR: Call took too long (max. allowed time: " + this.#timeout + " ms) - TIMEOUT!");
        }, this.#timeout);

        // TODO: Implement real API call
        Debug.createHIC(hic, () => {
            if (timedOut == false){
                window.clearTimeout(timeoutId);
                onSuccess();
            }
        });
    }
}