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
        const api = new API("/api", 8000);
        const ui = new UI(
            document.querySelector("#dialogs"),
            document.querySelector("#title"),
            document.querySelector("main")
        );
        api.fetchLanguageMeta(
            (languageMeta) => {
                console.log(languageMeta);
                ui.hidePreloader();
                ui.showContent();
            },
            (error) => {
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