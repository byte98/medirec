// MediRec - simple web application to save some basic medical records.
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

/**
 * Data model for language metadata returned by the MediRec API.
 */
class LanguageMeta {
    /**
     * Create language metadata.
     * @param {object} data API language metadata.
     */
    constructor(data) {
        this.code = data.code;
        this.name = data.name;
        this.nativeName = data.nativeName;
        this.version = data.version;
        this.flag = data.flag;
    }
}
