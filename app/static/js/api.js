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

/** Wrapper around the MediRec HTTP API. */
class API {
    /** @param {string} endpoint API endpoint. @param {number} timeout Request timeout in milliseconds. */
    constructor(endpoint, timeout = 8000) {
        this.#endpoint = endpoint;
        this.#timeout = timeout;
    }

    /** @type {string} @private */
    #endpoint;
    /** @type {number} @private */
    #timeout;

    /**
     * Execute an HTTP request.
     * @param {string} path API path.
     * @param {object} options Fetch options.
     * @returns {Promise<any>} Parsed response.
     */
    async #request(path, options = {}) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), this.#timeout);
        let response;
        let body;
        try {
            response = await fetch(`${this.#endpoint}${path}`, {...options, signal: controller.signal});
            body = await response.json();
        } finally {
            window.clearTimeout(timer);
        }
        if (!response.ok) {
            const message = body && body.detail ? body.detail : `HTTP ${response.status}`;
            throw new Error(message);
        }
        const reti = body;
        return reti;
    }

    /** @returns {Promise<object[]>} Language metadata. */
    fetchLanguageMeta() { const reti = this.#request('/languages'); return reti; }
    /** @param {string} code Language code. @returns {Promise<object>} Language data. */
    fetchLanguage(code) { const reti = this.#request(`/languages/${encodeURIComponent(code)}`); return reti; }
    /** @returns {Promise<object[]>} Clients. */
    fetchClients() { const reti = this.#request('/clients'); return reti; }
    /** @returns {Promise<object[]>} Health insurance companies. */
    fetchHealthInsuranceCompanies() { const reti = this.#request('/health-insurance-companies'); return reti; }
    /** @param {object} company Company. @returns {Promise<object>} Created company. */
    createHIC(company) { const reti = this.#request('/health-insurance-companies', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(company)}); return reti; }
    /** @param {object} client Client. @returns {Promise<object>} Created client. */
    createClient(client) { const reti = this.#request('/clients', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(client)}); return reti; }
    /** @param {string} identifier Client identifier. @returns {Promise<object>} Client. */
    fetchClient(identifier) { const reti = this.#request(`/clients/${encodeURIComponent(identifier)}`); return reti; }
    /** @param {string} identifier Client identifier. @returns {Promise<object>} Delete result. */
    deleteClient(identifier) { const reti = this.#request(`/clients/${encodeURIComponent(identifier)}`, {method:'DELETE'}); return reti; }
    /** @param {string} identifier Client identifier. @param {object} measurement Measurement. @returns {Promise<object>} Stored measurement. */
    addMeasurement(identifier, measurement) { const reti = this.#request(`/clients/${encodeURIComponent(identifier)}/measurements`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(measurement)}); return reti; }
    /**
     * Generate report preview HTML.
     * @param {string} identifier Client identifier.
     * @param {object} options Report options.
     * @returns {Promise<string>} Report HTML.
     */
    async previewReport(identifier, options) {
        const response = await fetch(`${this.#endpoint}/clients/${encodeURIComponent(identifier)}/reports/preview`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(options)
        });
        const body = await response.text();
        if (!response.ok) {
            let message = `HTTP ${response.status}`;
            try {
                const error = JSON.parse(body);
                message = error.detail || message;
            } catch (error) {
                message = body || message;
            }
            throw new Error(message);
        }
        const reti = body;
        return reti;
    }
    /** @param {string} identifier Client identifier. @param {object} options Report options. @returns {Promise<Response>} PDF response. */
    createReport(identifier, options) { const reti = fetch(`/api/clients/${encodeURIComponent(identifier)}/reports`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(options)}); return reti; }
    /** @param {string} identifier Client identifier. @returns {Promise<object[]>} Reports. */
    fetchReports(identifier) { const reti = this.#request(`/clients/${encodeURIComponent(identifier)}/reports`); return reti; }

}
