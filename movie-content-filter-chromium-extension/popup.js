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
var findUserButton = document.querySelector("#find-user-preferences");
var preferencesMessageArea = document.querySelector("#user-preferences-message-area");

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

function findUserID() {
    var userIDs = ["PmrqC", "ghBnb", "T3GDJ"]; // dummy values for now

    // Basic ASCII alphanumeric santization, from AD7six on Stack Overflow
    // Source: https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string
    var santizedIDValue = (userIDTextbox.value).replace(/[^0-9a-z]/gi, '');
    
    userIDTextbox.value = santizedIDValue; // Show santized string in the input box

    // Validate the input so the length is between 1 and 15 characters
    if((userIDTextbox.value).length < 1) {
        preferencesMessageArea.innerText = "Error: Needs alphanumeric characters";
        return null;
    }
    if ((userIDTextbox.value).length > 15) { // max length is arbitrary for now
        preferencesMessageArea.innerText = "Error: Needs to be shorter";
        return null;
    }

    for(var i = 0; i < userIDs.length; i++) {
        if(santizedIDValue == userIDs[i]) {
            return userIDs[i];
        }
    }

    // If the entered ID doesn't match any IDs in the database
    preferencesMessageArea.innerText = "Couldn't find it";
    return null;
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
    chrome.storage.sync.get(['mcfPrefsID'], function(result) {
        if(typeof (result.mcfPrefsID) === 'string') {
            userIDTextbox.value = result.mcfPrefsID;
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreSettingsFormOptions);
filterToggleCheckbox.addEventListener('change', filterToggleCheckboxChanged);
findUserButton.addEventListener('click', function() {
    var myUserID = findUserID();
    if(myUserID != null) {
        preferencesMessageArea.innerText = "Found it";
        chrome.storage.sync.set({mcfPrefsID: myUserID});
        
        // Set filter values
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "set_filter_actions"});
        });
    }
});
