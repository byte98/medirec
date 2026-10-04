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
    }
}