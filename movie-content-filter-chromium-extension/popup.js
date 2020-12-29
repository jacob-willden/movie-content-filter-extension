/*
    @source: https://github.com/jacob-willden/movie-content-filter-extension/
    @source: https://github.com/rdp/sensible-cinema/

    @licstart  The following is the entire license notice for the
    JavaScript code in this page.

    This file is part of the Movie Content Filter Browser Extension Project.
    
    Copyright (C) 2020 Jacob Willden

    Some of the code below was derived and modified from the 
    "edited_generic_player.js" source code file in the "chrome_extension" 
    folder in the "html5_javascript" folder from the Sensible Cinema 
    (Play It My Way) repository (source link above), and they are 
    explicitly labled as so.

    Sensible Cinema (Play It My Way) Source Code Copyright (C) 2016, 2017, 2018 Roger Pack 
    (Released Under the Lesser General Public License (LGPL))

    Afformentioned source code derived and modified by Jacob Willden
    Start Date of Derivation/Modification: December 28, 2020

    Some of the code below was modified from example code from 
    the extension options tutorial on the Chrome Developer website 
    (https://developer.chrome.com/extensions/options), released 
    under the Creative Commons Attribution 3.0 license 
    (http://creativecommons.org/licenses/by/3.0/).

    "Movie Content Filter" Website Copyright (C) delight.im
    Website Link: https://www.moviecontentfilter.com/

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

    @licend  The above is the entire license notice for the 
    JavaScript code in this page.
*/

"use strict";

var filterToggleCheckbox = document.getElementById("toggle-filters-checkbox");
var userIDTextbox = document.getElementById("user-preferences-id");
var findUserButton = document.getElementById("find-user-preferences");
var preferencesMessageArea = document.getElementById("user-preferences-message-area");
var safeSeekSlider = document.getElementById("safe-seek-slider");
var safeSeekDisplayValue = document.getElementById("safe-seek-display-value");

var userPrefs = [ // dummy values for now
    {"id": "PmrqC", "gambling": 3, "tedious": 2, "warfare": 1},
    {"id": "ghBnb", "gambling": 0, "tedious": 1, "warfare": 0},
    {"id": "T3GDJ", "gambling": 3, "tedious": 3, "warfare": 3}
];

function filterToggleCheckboxChanged() {
    if(filterToggleCheckbox.checked) {
        // set filter toggle to true
        chrome.storage.sync.set({mcfFilterOn: true});
    }
    else {
        // set filter toggle to false
        chrome.storage.sync.set({mcfFilterOn: false});
    }
    // Send message to content script saying checkbox changed
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "filter_checkbox_changed"});
    });
}

function validateIDInput(input) {
    if(typeof(input) !== 'string') {
        return null;
    }
    // Basic ASCII alphanumeric santization, from AD7six on Stack Overflow
    // Source: https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string
    var myIDValue = (input).replace(/[^0-9a-z]/gi, '');

    userIDTextbox.value = myIDValue; // Show santized string in the input box

    // Validate the input so the length is between 1 and 15 characters
    if((myIDValue).length < 1) {
        preferencesMessageArea.innerText = "Error: Needs alphanumeric characters";
        return null;
    }
    if((myIDValue).length > 25) {
        
        preferencesMessageArea.innerText = "Error: Needs to be shorter";
        return null;
    } // maximum length is arbitrary for now, appears to already be enforced by the maxlength HTML attribute

    return myIDValue;
}

function findUserID() {
    var santizedIDValue = validateIDInput(userIDTextbox.value);
    if(santizedIDValue == null) {
        return null;
    }

    for(var i = 0; i < userPrefs.length; i++) {
        if(santizedIDValue == userPrefs[i].id) {
            return userPrefs[i].id;
        }
    }

    // If the entered ID doesn't match any IDs in the database
    preferencesMessageArea.innerText = "Couldn't find it";
    return null;
}

function restoreSettingsFormOptions() {
    chrome.storage.sync.get(['mcfFilterOn'], function(result) {
        if(result.mcfFilterOn == true) {
            filterToggleCheckbox.checked = true;
        }
        else if (result.mcfFilterOn == false) {
            filterToggleCheckbox.checked = false;
        }
        //console.log("Checkbox value: " + result.mcfFilterOn);
    });
    chrome.storage.sync.get(['mcfPrefsID'], function(result) {
        var resultID = validateIDInput(result.mcfPrefsID);
        if(resultID != null) {
            userIDTextbox.value = resultID;
        }
    });
}

function setFilterActions() {
    var myUserID = findUserID();
    if(myUserID != null) {
        preferencesMessageArea.innerText = "Found it";
        chrome.storage.sync.set({mcfPrefsID: myUserID});

        // Set filter values
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "set_filter_actions"});
        });
    }
}

// Derived and Modified from "edited_generic_player.js" from Sensible Cinema
function setupSafeSeekOnce() {

}

document.addEventListener('DOMContentLoaded', restoreSettingsFormOptions);
filterToggleCheckbox.addEventListener('change', filterToggleCheckboxChanged);
findUserButton.addEventListener('click', setFilterActions);