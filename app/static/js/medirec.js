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
 * Class, which just wraps main script of the application.
 */
class Medirec{

    /**
     * Main function of the script.
     */
    static main(){
        // Handle click on "menu" button in mobile view
        const menuButton = document.querySelector("#menu-button");
        if(menuButton !== null){
            menuButton.addEventListener("click", () => {
                const items = document.querySelectorAll("nav ul li:not(.mobile-only)");
                for(const item of items){
                    item.classList.toggle("not-mobile");
                }
                const chevrons = menuButton.querySelectorAll(".chevron");
                for(const chevron of chevrons){
                    chevron.classList.toggle("hidden");
                }
            });
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    Medirec.main();
});