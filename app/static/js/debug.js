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
 * Class, which mocks API calls.
 */
class Debug{

    /**
     * List of languages, which were already fetched from the API.
     * @type {Array<LanguageMeta>}
     * @private
     */
    static #fetchedLangs  = [];

    /**
     * List of health insurance companies, which were already fetched from the API.
     * @type {Array<HealthInsuranceCompany>}
     * @private
     */
    static #fetchedHICs = [];

    /**
     * Waits for a random time and then calls the given method.
     * @param {function} method Method, which is called after waiting.
     * @param {number} min Minimum time to wait in milliseconds.
     * @param {number} max Maximum time to wait in milliseconds.
     */
    static #waitFor(method, min = 1000, max = 4000){
        const wait = Math.floor(Math.random() * (max - min + 1) + min);
        setTimeout(() => {
            method();
        }, wait);
    }

    /**
     * Generates a random string of a given length.
     * @param {number} min Minimum length of the string.
     * @param {number} max Maximum length of the string.
     * @param {string} alphabet The alphabet to use for generating the string.
     * @returns {string} The generated random string.
     */
    static #randomString(min = 16, max = 32, alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"){
        const length = Math.floor(Math.random() * (max - min + 1) + min);
        let result = "";
        for (let i = 0; i < length; i++){
            let index = Math.floor(Math.random() * alphabet.length);
            result += alphabet[index];
        }
        return result;
    }

    /**
     * Generates a random integer within a given range.
     * @param {number} min Minimum value of the range.
     * @param {number} max Maximum value of the range.
     * @returns {number} The generated random integer.
     */
    static #randomInteger(min = 0, max = 100){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Generates pseudo-random metadata for a language.
     * @returns {LanguageMeta} The generated language metadata.
     */
    static #generateLanguageMetadata(){
        const meta = [
            ["en", "English", "English", Debug.#randomString(), "../svg/gb.svg"],
            ["cs", "Czech", "Čeština", Debug.#randomString(), "../svg/cz.svg"],
            ["de", "German", "Deutsch", Debug.#randomString(), "../svg/de.svg"],
            ["fr", "French", "Français", Debug.#randomString(), "../svg/fr.svg"],
            ["es", "Spanish", "Español", Debug.#randomString(), "../svg/es.svg"],
            ["it", "Italian", "Italiano", Debug.#randomString(), "../svg/it.svg"],
            ["ru", "Russian", "Русский", Debug.#randomString(), "../svg/ru.svg"],
            ["zh", "Chinese", "中文", Debug.#randomString(), "../svg/cn.svg"],
            ["ja", "Japanese", "日本語", Debug.#randomString(), "../svg/jp.svg"],
            ["ko", "Korean", "한국어", Debug.#randomString(), "../svg/kr.svg"],
            ["ar", "Arabic", "العربية", Debug.#randomString(), "../svg/sa.svg"],
            ["pt", "Portuguese", "Português", Debug.#randomString(), "../svg/pt.svg"],
            ["hi", "Hindi", "हिन्दी", Debug.#randomString(), "../svg/in.svg"],
            ["bn", "Bengali", "বাংলা", Debug.#randomString(), "../svg/bd.svg"],
            ["pa", "Punjabi", "ਪੰਜਾਬੀ", Debug.#randomString(), "../svg/pk.svg"],
            ["jv", "Javanese", "ꦧꦱꦗꦮ", Debug.#randomString(), "../svg/id.svg"],
            ["ms", "Malay", "Bahasa Melayu", Debug.#randomString(), "../svg/my.svg"],
            ["vi", "Vietnamese", "Tiếng Việt", Debug.#randomString(), "../svg/vn.svg"],
            ["th", "Thai", "ไทย", Debug.#randomString(), "../svg/th.svg"],
            ["tr", "Turkish", "Türkçe", Debug.#randomString(), "../svg/tr.svg"],
            ["fa", "Persian", "فارسی", Debug.#randomString(), "../svg/ir.svg"],
            ["sw", "Swahili", "Kiswahili", Debug.#randomString(), "../svg/ke.svg"],
            ["am", "Amharic", "አማርኛ", Debug.#randomString(), "../svg/et.svg"],
            ["ha", "Hausa", "Hausa", Debug.#randomString(), "../svg/ng.svg"],
            ["yo", "Yoruba", "Èdè Yorùbá", Debug.#randomString(), "../svg/ng.svg"],
            ["ig", "Igbo", "Asụsụ Igbo", Debug.#randomString(), "../svg/ng.svg"],
            ["zu", "Zulu", "isiZulu", Debug.#randomString(), "../svg/za.svg"]
        ];
        const idx = Math.floor(Math.random() * meta.length);
        const [code, name, nativeName, version, flag] = meta[idx];
        return new LanguageMeta(code, name, nativeName, version, flag);
    }

    /**
     * Generates an array of pseudo-random metadata for languages.
     * @param {number} min Minimum number of languages to generate.
     * @param {number} max Maximum number of languages to generate.
     * @param {boolean} exclusive Flag, whether generated data should be exclusive (no duplicates) or not. !WARNING! This flag may lead to infinite loop if the range of min and max is too high and exclusive is set to true.
     * @param {LanguageMeta[]} include Array of language metadata to include in the generated array.
     * @returns {LanguageMeta[]} The generated array of language metadata.
     */
    static #generateLanguageMetadatas(min, max, exclusive = false, include = []){
        const reti = [];
        const count = Debug.#randomInteger(min, max);
        for (let i = 0; i < count; i++){
            const meta = Debug.#generateLanguageMetadata();
            if (exclusive == true){
                let exists = false;
                for (const m of reti){
                    if (m.code === meta.code){
                        exists = true;
                        break;
                    }
                }
                if (exists == false){
                    reti.push(meta);
                } else {
                    i -= 1;
                }
            }
            else {
                reti.push(meta);
            }
        }
        for (const m of include){
            let exists = false;
            for (const r of reti){
                if (r.code === m.code){
                    exists = true;
                    break;
                }
            }
            if (exists == false){
                reti.push(m);
            }
        }
        return reti;
    }

    /**
     * Method, which simulates fetching language metadata from the API.
     * @param {Function<Array<LanguageMeta>>} callback The callback function to call with the fetched metadata.
     */
    static fetchLanguageMetadata(callback){
        Debug.#waitFor(() => {
            const data = Debug.#generateLanguageMetadatas(8, 16, true, [new LanguageMeta("en", "English", "English", Debug.#randomString(), "../svg/gb.svg"), new LanguageMeta("cs", "Czech", "Čeština", Debug.#randomString(), "../svg/cz.svg")]);
            callback(data);
        });
    }

    /**
     * Method, which simulates saving language metadata to the IndexedDB database.
     * @param {LanguageMeta} meta The language metadata to save.
     * @param {function()} callback The callback function to call on success.
     */
    static saveLanguageMetadata(meta, callback){
        Debug.#waitFor(() => {
            let newMeta = [];
            for (const m of Debug.#fetchedLangs){
                if (m.code !== meta.code){
                    newMeta.push(m);
                }
            }
            newMeta.push(meta);
            Debug.#fetchedLangs = newMeta;
            callback();
        });
    }

    /**
     * Saves multiple language metadatas to the IndexedDB database.
     * @param {LanguageMeta[]} metas Metadatas of the languages to save.
     * @param {function()} callback The callback function to call on success.
     */
    static saveLanguageMetas(metas, callback){
        Debug.#waitFor(() => {
            let newMeta = [];
            for (const meta of metas){
                let exists = false;
                for (const m of Debug.#fetchedLangs){
                    if (m.code === meta.code){
                        exists = true;
                        break;
                    }
                }
                if (exists == false){
                    newMeta.push(meta);
                }
            }
            Debug.#fetchedLangs = Debug.#fetchedLangs.concat(newMeta);
            callback();
        });
    }

    /**
     * Obtains language metadata from the IndexedDB database.
     * @param {string} code The code of the language to obtain.
     * @param {function(LanguageMeta | null)} callback The callback function to call with the obtained metadata.
     */
    static getLanguageMetadata(code, callback){
        Debug.#waitFor(() => {
            let reti = null;
            for (const m of Debug.#fetchedLangs){
                if (m.code === code){
                    reti = m;
                    break;
                }
            }
            callback(reti);
        });
    }

    /**
     * Loads language metadata from the IndexedDB database.
     * @param {function(LanguageMeta[])} callback The callback function to call with the loaded metadata.
     */
    static loadLanguageMetadata(callback){
        Debug.#waitFor(() => {
            callback(Debug.#fetchedLangs);
        });
    }

    /**
     * Creates a new HIC (Health Insurance Company) in the system.
     * @param {HealthInsuranceCompany} hic The HIC data to create.
     * @param {function()} callback The callback function to call on success.
     */
    static createHIC(hic, callback){
        Debug.#waitFor(() => {
            Debug.#fetchedHICs.push(hic);
            callback();
        });
    }
}