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
 * Controller for creating health-insurance companies.
 */
class NewHIC {
    /**
     * Initialize the health-insurance-company form.
     */
    static initialize() {
        const form = document.querySelector("#new-hic-form");
        if (form.dataset.initialized === "true") {
            return;
        }

        form.dataset.initialized = "true";
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            Medirec.ui.showWait();

            try {
                await Medirec.api.createHIC(data);
                form.reset();
                await Home.refreshData();
                window.location.hash = "#hic";
            } catch (error) {
                Medirec.ui.showDialog(
                    "error",
                    LanguageBase.translate("error"),
                    String(error),
                    "",
                    [[]],
                    true
                );
            } finally {
                Medirec.ui.hideWait();
            }
        });
    }
}
