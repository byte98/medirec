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
 * Class, which just wraps home page of the application.
 */
class Home{
    /**
     * Main function of the home page.
     */
    static  main(){        
        window.location.hash = "";
        // Navigation handling
        const showSection = (sectionId = "") => {
            const realId = sectionId == "" ? "content" : sectionId;
            const sections = document.querySelectorAll("main > section");
            const sectionExists = Array.from(sections).some((section) => section.id == realId);
            if(sectionExists ===  true){
                for(const section of sections){
                    if(section.id == realId){
                        section.classList.remove("hidden");
                    }else{
                        section.classList.add("hidden");
                    }
                }
            }
        }
        window.addEventListener("hashchange", (event) => {
            const hash = window.location.hash;
            const sectionId = hash.length > 1 ? hash.substring(1) : "";
            showSection(sectionId);
        });

        const api = Medirec.api;
        const ui = Medirec.ui;
        ui.lockLoader();
        api.fetchLanguageMeta(
            (languageMeta) => {
                // TODO: Implement language updating...
                api.saveLanguageMetas(languageMeta, () => {
                    ui.unlockLoader();
                    Medirec.loadLanguages();
                },
                (error) => {
                    ui.unlockLoader();
                    ui.hideContent();
                    ui.showPreloader();
                    ui.hidePreloaderAnimation();
                    ui.showDialog(
                        "error",
                        "Start of the application failed!",
                        "Application couldn't start - translation service failed.\nTry it again later, please.\nIf the problem persists, please contact the administrator.",
                        error,
                        [
                            [
                                () => {window.location.reload();},
                                "Try again",
                                "refresh-sharp"
                            ]
                        ],
                        true,
                        0
                    );
                });
                
                
                
            },
            (error) => {
                ui.unlockLoader();
                ui.hidePreloaderAnimation();
                ui.showDialog(
                    "error",
                    "Start of the application failed!",
                    "Application couldn't start - translation service failed.\nTry it again later, please.\nIf the problem persists, please contact the administrator.",
                    error,
                    [
                        [
                            () => {window.location.reload();},
                            "Try again",
                            "refresh-sharp"
                        ]
                    ],
                    true,
                    0
                );
            }
        );
    }
}




document.addEventListener("DOMContentLoaded", () => {
    Home.main();
});