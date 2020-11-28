/*
    @source: https://github.com/jacob-willden/movie-content-filter-extension/

    @licstart  The following is the entire license notice for the
    JavaScript code in this page.

    This file is part of the Movie Content Filter Browser Extension Project.
    Copyright (C) 2020 Jacob Willden

    The Movie Content Filter Browser Extension Project is free software: 
    you can redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The project is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    the code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.

    You should have recieved a copy of the GNU General Public License
    along with this project. Otherwise, see: https://www.gnu.org/licenses/

    Also, some of the code below was modified from the extension options 
    tutorial on the Chrome Developer website 
    (https://developer.chrome.com/extensions/options), 
    released under the Creative Commons Attribution 3.0 license 
    (http://creativecommons.org/licenses/by/3.0/).

    @licend  The above is the entire license notice for the 
    JavaScript code in this page.

    "Movie Content Filter" Website Copyright (C) delight.im
    Website Link: https://www.moviecontentfilter.com/
*/

var filterToggleCheckbox = document.querySelector("#toggle-filters-checkbox");
var userIDTextbox = document.querySelector("#user-preferences-id");

function filterToggleCheckboxChanged(event) {
    if(filterToggleCheckbox.checked) {
        // set filter toggle to true
        chrome.storage.sync.set({filterToggle: true});
    }
    else {
        // set filter toggle to false
        chrome.storage.sync.set({filterToggle: false});
    }
}

function restoreSettingsFormOptions() {
    chrome.storage.sync.get(['filterToggle'], function(result) {
        if(result.filterToggle == true) {
            filterToggleCheckbox.checked = true;
        }
        else if (result.filterToggle == false) {
            filterToggleCheckbox.checked = false;
        }
        //alert("Checkbox value: " + result.filterToggle);
    });
}

document.addEventListener('DOMContentLoaded', restoreSettingsFormOptions);
filterToggleCheckbox.addEventListener('change', filterToggleCheckboxChanged);
