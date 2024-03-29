/*
    @source: https://github.com/jacob-willden/movie-content-filter-extension/
    @source: https://github.com/fruiz500/VideoSkip-extension/
    @source: https://github.com/rdp/sensible-cinema/

    @licstart  The following is the entire license notice for the
    JavaScript code in this page.

    This file is part of the Movie Content Filter Browser Extension Project.
    
    Movie Content Filter Browser Extension Project Copyright (C) 2020, 2021 Jacob Willden
    (Released under the GNU General Public License (GNU GPL) Version 3.0 or later)

    VideoSkip Source Code Copyright (C) 2020, 2021 Francisco Ruiz
    (Released under the GNU General Public License (GNU GPL))

    Sensible Cinema (Play It My Way) Source Code Copyright (C) 2016, 2017, 2018 Roger Pack 
    (Released under the Lesser General Public License (LGPL))

    Some parts of the code below were derived from the "videoskip.js" source code 
    file in the VideoSkip extension repository (source link above), and 
    it is explicitly labled as so. Some other parts of the code below were 
    derived and modified from the "edited_generic_player.js" source code 
    file in the "chrome_extension" folder in the "html5_javascript" folder 
    from the Sensible Cinema (Play It My Way) repository (source link above), 
    and it is explicitly labled as so.

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
    any later version. The project is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.

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

'use strict';

var popupTitle = document.getElementById("popup-title");
popupTitle.textContent = chrome.i18n.getMessage("extensionName");

var toggleFiltersText = document.getElementById("toggle-filters-label");
toggleFiltersText.textContent = chrome.i18n.getMessage("toggleFilters");

var yourPreferencesIDText = document.getElementById("user-preferences-id-label");
yourPreferencesIDText.textContent = chrome.i18n.getMessage("yourPreferencesID");

var findUserButton = document.querySelector("#find-user-preferences");
findUserButton.value = chrome.i18n.getMessage("findIDButton");

var filterToggleCheckbox = document.getElementById("toggle-filters-checkbox");
var userIDTextbox = document.getElementById("user-preferences-id");
var preferencesMessageArea = document.getElementById("user-preferences-message-area");
//var safeSeekSlider = document.getElementById("safe-seek-slider");
//var safeSeekDisplayValueArea = document.getElementById("safe-seek-display-value");

var findPreferencesForm = document.querySelector("form");

function checkForBlankID() {
    var yourPreferencesIDError = document.getElementById("user-preferences-id-error");
    if(!userIDTextbox.value) {
        userIDTextbox.setAttribute('aria-invalid', 'true');
        userIDTextbox.setAttribute('aria-describedby', 'user-preferences-id-error');
        yourPreferencesIDError.textContent = 'Error: ' + chrome.i18n.getMessage("blankID");
    }
    else {
        userIDTextbox.setAttribute('aria-invalid', 'false');
        userIDTextbox.removeAttribute('aria-describedby');
        yourPreferencesIDError.textContent = '';
    }
}

userIDTextbox.addEventListener('blur', checkForBlankID);

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

function findUserID() {
    var santizedIDValue = validateIDInput(userIDTextbox.value);
    userIDTextbox.value = santizedIDValue; // Show santized string in the input box
    if(santizedIDValue === null) {
        return null;
    }

    for(var i = 0; i < userPrefs.length; i++) {
        if(santizedIDValue === userPrefs[i].id) {
            return userPrefs[i].id;
        }
    }

    // If the entered ID doesn't match any IDs in the database
    return null;
}

function restoreSettingsFormOptions() {
    chrome.storage.sync.get({mcfFilterOn: true}, function(result) {
        if(result.mcfFilterOn === true) {
            filterToggleCheckbox.checked = true;
        }
        else {
            filterToggleCheckbox.checked = false;
        }
        //console.log("Checkbox value: " + result.mcfFilterOn);
    });
    chrome.storage.sync.get(['mcfPrefsID'], function(result) {
        var resultID = validateIDInput(result.mcfPrefsID);
        if(resultID) {
            userIDTextbox.value = resultID;
        }
    });
}

function setFilterActions(event) {
    event.preventDefault();
    checkForBlankID();
    var myUserID = findUserID();
    if(myUserID) {
        preferencesMessageArea.textContent = chrome.i18n.getMessage("foundTheID"); // Found the entered ID
        chrome.storage.sync.set({mcfPrefsID: myUserID});

        // Set filter values
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "set_filter_actions"});
        });
    }
    else if(userIDTextbox.value) {
        preferencesMessageArea.textContent = chrome.i18n.getMessage("failedToFindID"); // Could not find the entered ID
    }
    else {
        preferencesMessageArea.textContent = chrome.i18n.getMessage("blankID"); // No ID entered
    }
}

document.addEventListener('DOMContentLoaded', restoreSettingsFormOptions);
filterToggleCheckbox.addEventListener('change', filterToggleCheckboxChanged);
findPreferencesForm.addEventListener('submit', setFilterActions);

// Add promise error handling?

// Safe Seek Functions

/* 

// Derived from "videoskip.js" from VideoSkip
//to put seconds into hour:minute:second format
function toHMS(seconds) {
	var hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor((seconds % 60) * 100) / 100;			//precision is 0.01 s
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return hours + ":" + minutes + ":" + seconds;
}

// Derived from "edited_generic_player.js" from Sensible Cinema
function addListenerMulti(element, eventNames, listener) {
    var events = eventNames.split(' ');
    for(var i = 0, iLen = events.length; i < iLen; i++) {
        element.addEventListener(events[i], listener, false);
    }
}

function requestCurrentTime() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "request_current_time"}, function(response) {
            return response.myCurrentTime;
        });
    });
}

function requestDuration() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "request_duration"}, function(response) {
            return response.myDuration;
        });
    });
}

var isSafeSeekSliderBeingDragged = false; // Derived from the seek_dragger_being_dragged variable from "edited_generic_player.js"

// Derived and Modified from "edited_generic_player.js"
function updateSafeSeekTime() {
    if(!isSafeSeekSliderBeingDragged) {
        var currentTime = requestCurrentTime();
        safeSeekSlider.value = currentTime / requestDuration() * 100;
        if(safeSeekDisplayValueArea.textContent !== toHMS(currentTime)) {
            safeSeekDisplayValueArea.textContent = toHMS(currentTime);
        }
    } // else let the mouse movement change it only...it's about to seek soon'ish...
}

// Derived and Modified from "edited_generic_player.js"
function setupSafeSeekOnce() {
    addListenerMulti(safeSeekSlider, "mousedown touchstart", function() {
        isSafeSeekSliderBeingDragged = true;
    });
    
    addListenerMulti(safeSeekSlider, "mouseup touchend", function() {
        isSafeSeekSliderBeingDragged = false;
        //seekToPercentage(this.value);
    });

    addListenerMulti(safeSeekSlider, "mousemove touchmove", function() {
        if (isSafeSeekSliderBeingDragged) {
            var desiredTimeInSeconds = requestDuration() / 100.0 * this.value;
            safeSeekDisplayValueArea.textContent = toHMS(desiredTimeInSeconds);
            // but don't seek yet :)
         }
    });

    setInterval(updateSafeSeekTime, 250); // only 4/sec because ... uh...
}

setupSafeSeekOnce(); 

*/

// End of Safe Seek Functions