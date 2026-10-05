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
 * Class, which wraps script for creating new health insurance company.
 */
class NewHIC{

    /**
     * Main function of the script.
     */
    static main(){
        document.querySelector("#save-hic").addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const form = document.querySelector("#new-hic-form");
            if (form.checkValidity()){
                form.requestSubmit();
            }
        });

        const form = document.querySelector("#new-hic-form");
        form.addEventListener("reset", () => {
            window.location.hash = "#hic";
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();
            Medirec.ui.showWait();
            const hic = new HealthInsuranceCompany(
                form.querySelector("#new-hic-code").value,
                form.querySelector("#new-hic-abbr").value,
                form.querySelector("#new-hic-name").value,
                form.querySelector("#new-hic-note").value
            );
            Medirec.api.createHIC(
                hic,
                () => {
                    Medirec.ui.hideWait();
                    window.location.hash = "#hic";
                    Medirec.ui.showDialog(
                        "success",
                        "Health insurance company created",
                        "Health insurance company '" + hic.name + "' was successfully created.",
                        "",
                        [[]],
                        true,
                        3000
                    );
                },
                (warnings) => {
                    Medirec.ui.hideWait();
                    let message = "";
                    for(const warning of warnings){
                        message += " - " +warning + "\n";
                    }
                    Medirec.ui.showDialog(
                        "warning",
                        "Creation of health insurance company failed",
                        "The health insurance company '" + hic.name + "' could not be created due to the following warnings:\n" + message,
                        "",
                        [[]],
                        true
                    );
                }, 
                (error) => {
                    Medirec.ui.hideWait();
                    Medirec.ui.showDialog(
                        "error",
                        "Creation of health insurance company failed",
                        "The health insurance company '" + hic.name + "' could not be created.\nPlease, try it again later.\nIf the problem persists, please contact support.",
                        error,
                        [[]],
                        true
                    );
                });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    NewHIC.main();
});