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

    Most of the code below was derived and modified from several source 
    code files in the VideoSkip extension repository (source link above), 
    including "content1.js", "content2.js", and "videoskip.js", and 
    it is explicitly labled as so. Various other parts of the code below 
    were derived and modified from the "edited_generic_player.js" and 
    "contentscript.js" source code files in the "chrome_extension" folder 
    in the "html5_javascript" folder from the Sensible Cinema 
    (Play It My Way) repository (source link above), and it is explicitly 
    labled as so.

    Afformentioned source code derived and modified by Jacob Willden
    Start Date of Derivation/Modification: November 20, 2020

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

"use strict";

var filterScriptAlreadyRunning = false; // To prevent the script from running twice (may need to modify for Amazon TV shows?)

function filterScript() {
    filterScriptAlreadyRunning = true;

    console.log("starting main section of content script");
    var filtersEnabled = true;
    var myVideo = null;
    var serviceName = window.location.hostname;

    var userPrefs = [ // dummy values for now
        {"id": "PmrqC", "gambling": 3, "tedious": 2, "warfare": 1},
        {"id": "ghBnb", "gambling": 4, "tedious": 1, "warfare": 3},
        {"id": "T3GDJ", "gambling": 1, "tedious": 1, "warfare": 1}
    ];

    // Function derived and modified from "edited_generic_player.js" from Sensible Cinema
    function findFirstVideoTagOrNull() {
        if(serviceName.includes('tv.apple.com')) {
            try {
                var foundVideo = document.querySelector("apple-tv-plus-player").shadowRoot.querySelector("amp-video-player-internal").shadowRoot.querySelector("amp-video-player").shadowRoot.querySelector("video");
                if(foundVideo) {
                    return foundVideo;
                }
                return null;
            }
            catch {
                //console.log("Apple TV video element not found. Video probably not opened yet");
                return null;
            }
        }
        else {
            var all = document.getElementsByTagName("video");
            // look for first "real" playing vid as it were [byu.tv needs this, it has two, first is an ad player, i.e. wrong one]
            for(var i = 0, len = all.length; i < len; i++) {
                if (all[i].currentTime > 0) {
                    return all[i];
                } 
            }
            // don't *want* to work with iframes from the plugin side since they'll get their own edited playback copy
            // hopefully this is enough to prevent double loading (once windows.document, one iframe if they happen to be allowed :|
            return null;
        }
    }

    function validateIDInput(input) {
        if(typeof(input) !== 'string') {
            return null;
        }
        // Basic ASCII alphanumeric santization, from AD7six on Stack Overflow
        // Source: https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string
        var santizedIDValue = (input).replace(/[^0-9a-z]/gi, '');
    
        // Validate the input so the length is between 1 and 15 characters
        if((santizedIDValue).length < 1) {
            return null;
        }
        if((santizedIDValue).length > 25) { // max length is arbitrary for now
            return null;
        }
        return santizedIDValue;
    }

    function applyFilters(myPreferencesID) {
        console.log("fetching allCuts");
        var allCuts = [ // Some dummy values for now
            {"startTime": 10, "endTime": 12, "category": "gambling", "severity": 1, "action": "mute"},
            {"startTime": 17, "endTime": 19, "category": "gambling", "severity": 1, "action": "blank"},
            {"startTime": 24, "endTime": 26, "category": "gambling", "severity": 1, "action": "skip"},
            {"startTime": 31, "endTime": 33, "category": "tedious", "severity": 2, "action": "mute"},
            {"startTime": 38, "endTime": 40, "category": "tedious", "severity": 2, "action": "blank"},
            {"startTime": 45, "endTime": 47, "category": "tedious", "severity": 2, "action": "skip"},
            {"startTime": 52, "endTime": 54, "category": "warfare", "severity": 3, "action": "mute"},
            {"startTime": 59, "endTime": 61, "category": "warfare", "severity": 3, "action": "blank"},
            {"startTime": 66, "endTime": 68, "category": "warfare", "severity": 3, "action": "skip"}
        ];
        var activeCuts = [];
        //for(var i = 0; i < allCuts.length; i++) {
        //    console.log(allCuts[i]);
        //}

        var prevAction = '';

        // Determine which filter tags should be set, based on user preferences
        function setActions(userID) {
            console.log("setting filter actions");
            for(var i = 0; i < userPrefs.length; i++) {
                if(userPrefs[i].id == userID) {
                    var myPreferences = userPrefs[i];
                }
            }

            activeCuts = []; // Clear array to prevent duplicate filter tags
            
            // Modified from isSkipped function from "videoskip.js" from VideoSkip
            for(var j = 0; j < allCuts.length; j++) {
                var tagCategory = allCuts[j].category;
                var tagSeverity = allCuts[j].severity;
                if(tagSeverity >= myPreferences[tagCategory]) {
                    activeCuts.push(allCuts[j]);
                }
            }
        }

        setActions(myPreferencesID);

        // Maybe add currentUrlNotIframe() function from "edited_generic_player.js" from Sensible Cinema later?
        // Definitely add blankScreenIfWithinHeartOfSkip() and some other functions below it later

        // From videoskip.js
        // hour:minute:second string to decimal seconds
        function fromHMS(timeString) {
            timeString = timeString.replace(/,/,".");			//in .srt format decimal seconds use a comma
            var time = timeString.split(":");
            if(time.length == 3) {							//has hours
                return parseInt(time[0])*3600 + parseInt(time[1])*60 + parseFloat(time[2]);
            }
            else if(time.length == 2){					//minutes and seconds
                return parseInt(time[0])*60 + parseFloat(time[1]);
            }
            else {											//only seconds
                return parseFloat(time[0]);
            }
        }

        function isThisAmazon() {
            if(serviceName.includes('amazon')) { // This includes any Amazon top-level domain or subdomain
                return true;
            }
            else {
                return false;
            }
        }

        function isThisIMDbTV() {
            if(serviceName.includes('imdb')) {
                return true;
            }
            else {
                return false;
            }
        }

        function isThisAppleTV() {
            if(serviceName.includes('apple')) {
                return true;
            }
            else {
                return false;
            }
        }

/*         function isThisYoutube() {
            if(serviceName.includes('youtube')) {
                return true;
            }
            else {
                return false;
            }
        } */

        // Function derived from "edited_generic_player.js" from Sensible Cinema
/*         function isAmazonTenSecondsOff() {
            // the new way has both webPlayerContainer and webPlayerUIContainer, old lacks latter [and is 10s off]
            var x = document.getElementsByClassName("webPlayerUIContainer");
            if (x.length > 0) {
                return false; // new
            } 
            else {
                return true; // old
            }
        } */

        var adIndicator = null;
        var setForAdvertisement = false;

        // Function created by Jacob Willden
        function isWatchingAdvertisement() {
            if(isThisAmazon() || isThisIMDbTV()) { // They have the same advertisement system
                adIndicator = document.querySelector(".atvwebplayersdk-adtimeindicator-text");
                if(adIndicator != null) {
                    return true;
                }
                else {
                    return false;
                }
            }
/*             if(isThisYoutube()) {
                adIndicator = document.querySelector(".ytp-ad-player-overlay");
                if(adIndicator != null) {
                    return true;
                }
                else {
                    return false;
                }
            } */
            else {
                return false;
            }
        }

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema (checkStatus)
        function checkForAdvertisement() {
            if(isWatchingAdvertisement() == true) {
                if(setForAdvertisement == false) {
                    setForAdvertisement = true;
                    // Ad is playing
                    console.log("ad just started");
                }
            }
            else {
                if(setForAdvertisement == true) {
                    setForAdvertisement = false;
                    // Ad is over, now you can check for truncatedActualDuration
                    console.log("ad just ended");
                }
            }
        }

        if(isThisAmazon() || isThisIMDbTV() /* || isThisYoutube() */ ) { // If bringing back Youtube later, be sure to separate into a another if statement
            // If the video is on a website with video advertisements
            setInterval(checkForAdvertisement, 10);
            // Keep interval going in case there's another ad (for IMDb and Youtube, may be able to clear it for Amazon?)
        }

        var durationDifference = 0;
        var timeIndicator = null;

        // Function created by Jacob Willden
        function getAmazonTruncatedActualDuration(timeIndicator) {
            //console.log("the full text: " + timeIndicator.innerText);
            var bothTimesArray = timeIndicator.innerText.split("/");
            //console.log(bothTimesArray);
            var elapsedTime = fromHMS(bothTimesArray[0].replace(/[^0-9:]/g, ''));
            var remainingTime = fromHMS(bothTimesArray[1].replace(/[^0-9:]/g, ''));
            // The regular expressions above are to remove any characters that aren't digits or colons
            //console.log("elapsedTime: " + elapsedTime + " remainingTime: " + remainingTime);

            var truncatedActualDuration = elapsedTime + remainingTime;
            return truncatedActualDuration;
        }
        
        // Function source: https://www.includehelp.com/code-snippets/get-the-decimal-part-of-a-floating-number-in-javascript.aspx
        function getDecimalFromFloat(number) {
            return (number - Math.floor(number));
        }
        
        function setDurationDifference() {
            // Get real video duration by adding the truncated duration and the decimal value from the video's duration attribute
            // This assumes that ad durations are always integers (will want to test this more)
            var realDuration = getAmazonTruncatedActualDuration(timeIndicator) + parseFloat(getDecimalFromFloat(myVideo.duration).toFixed(3));
            durationDifference = myVideo.duration - realDuration;
            //console.log("new durationDifference: " + durationDifference);
        }

        function checkForTimeIndicator() {
            var interval = setInterval(function() {
                timeIndicator = document.querySelector(".atvwebplayersdk-timeindicator-text");
                if((isThisAmazon()) && (timeIndicator) && (timeIndicator.innerText.length > 6)) { // The div appears to have a non-breaking space (6 characters) before inserting the times. For IMDb TV, the duration difference is checked in getCurrentTime()
                    clearInterval(interval);
                    setDurationDifference();
                }
            }, 100);
        }

        if(isThisAmazon() || isThisIMDbTV()) {
            checkForTimeIndicator(); // To help with consistent video timing
        }

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema
        function getCurrentTime() {
            if(isThisAmazon()) { // Only works if all ads are integer lengths
                return myVideo.currentTime - durationDifference;                
            }
            if(isThisIMDbTV()) { // Only works if all ads are integer lengths
                if(timeIndicator) {
                    var bothTimesArray = timeIndicator.innerText.split("/");
                    var elapsedTimeInteger = fromHMS(bothTimesArray[0].replace(/[^0-9:]/g, '')); // The regular expression is to remove any characters that aren't digits or colons
                    var myTimeDecimal = getDecimalFromFloat(myVideo.currentTime);
                    var myActualTime = elapsedTimeInteger + myTimeDecimal;
                    //console.log(myActualTime);
                    return myActualTime;
                }
                else {
                    return 0;
                }
            }
            if(isThisAppleTV()) {
                return myVideo.currentTime + 0.5;
            }
            else {
                return myVideo.currentTime;
            }
        }

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema
/*         function getDuration() {
            if(isThisAmazon() == true) {
                return myVideo.duration - durationDifference;
            }
            else {
                return myVideo.duration;
            }
        } */ // Not sure if isAmazonTenSecondsOff() should be checked too yet

        //by Naveen at StackOverflow, we use it to execute seek on Netflix
        // https://stackoverflow.com/questions/9602022/chrome-extension-retrieving-global-variable-from-webpage
        function executeOnPageSpace(code) {
            var script = document.createElement('script');
            script.id = 'tmpScript';
            script.textContent = 
            'document.getElementById("tmpScript").textContent = ' + String(code);
            document.documentElement.appendChild(script);
            var result = document.getElementById("tmpScript").textContent;
            script.remove();
            return result;
        }

        // Moves play to requested time, function derived and modified from "content2.js" from VideoSkip
        function goToTime(time) {
            if(serviceName == 'www.netflix.com') { 
                // In case the user seeks within a skip (?)
                //myVideo.style.opacity = 0;
                //Netflix will crash with the normal seek instruction. Modified from code by Dmitry Paloskin at StackOverflow. Must be executed in page context
                executeOnPageSpace('videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;sessions = videoPlayer.getAllPlayerSessionIds();player = videoPlayer.getVideoPlayerBySessionId(sessions[sessions.length-1]);player.pause();player.seek(' + time*1000 + ');player.play();');
            }
            // Modified from "edited_generic_player.js" from Sensible Cinema
            else if(isThisAmazon()) {
                myVideo.currentTime = time + durationDifference;
            }
            else if(isThisIMDbTV()) {
                myVideo.currentTime = (myVideo.currentTime - getCurrentTime()) + time;
            }
            else if(isThisAppleTV()) {
                myVideo.currentTime = time - 0.5;
            }
            else { //everyone else is HTML5 compliant
                myVideo.currentTime = time;
            }
        }

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if(request.message == "set_filter_actions") {
                    //console.log("got set filter actions message:" + request.preferences);
                    chrome.storage.sync.get(['mcfPrefsID'], function(result) {
                        var validatedID = validateIDInput(result.mcfPrefsID);
                        if(validatedID != null) {
                            setActions(validatedID);
                        }
                    });
                }
                
                if(request.message == "filter_checkbox_changed") {
                    chrome.storage.sync.get(['mcfFilterOn'], function(result) {
                        if(result.mcfFilterOn == true) {
                            filtersEnabled = true;
                        }
                        else {
                            filtersEnabled = false;
                        }
                    });
                }

/*                 if(request.message == "request_current_time") {
                    var requestedCurrentTime = getCurrentTime();
                    sendResponse({myCurrentTime: requestedCurrentTime});
                }

                if(request.message == "request_duration") {
                    var requestedDuration = getDuration();
                    sendResponse({myDuration: requestedDuration});
                } */

                /* if(request.message == "request_filter_id_list") { // Probably unnecessary?
                    sendResponse({filterIDList: userPrefs});
                } */
            }
        );

        // Execute filters during playback, derived and modified from anonymous function in "content2.js" from VideoSkip
        function doTheFiltering() {
            if((filtersEnabled == false) || (setForAdvertisement == true)) {
                return;
            }
            var action = '', startTime, endTime;
            for(var i = 0; i < activeCuts.length; i++) { //find out what action to take, according to timing and setting in activeCuts object
                startTime = activeCuts[i].startTime;
                endTime = activeCuts[i].endTime;
                if((getCurrentTime() > startTime) && (getCurrentTime() < endTime)) {
                    action = activeCuts[i].action;
                    break;    
                } 
                else {
                    action = '';
                }
            }
            if(action == prevAction) { //only apply action to the Document Object Model (DOM) if there's a change
                return;
            } 
            else if(action == 'skip') {
                console.log("skipping from: " + getCurrentTime() + " to " + endTime);
                goToTime(endTime);
            } 
            else if(action == 'blank') {
                console.log("blanking: " + getCurrentTime());
                myVideo.style.opacity = 0;
            } 
            else if(action == 'mute') {
                console.log("muting: " + getCurrentTime());
                myVideo.muted = true;
                // if(myVideo.textTracks.length > 0) myVideo.textTracks[0].mode = 'disabled';
            } 
            else {
                // Check if videoNotBuffering (or for seek event) before unhiding video?
                myVideo.style.opacity =  '';
                myVideo.muted = false;
                // if(myVideo.textTracks.length > 0) myVideo.textTracks[0].mode = 'showing';
            }
            prevAction = action;
        }

        myVideo.ontimeupdate = function() { // Sensible Cinema says timeupdate isn't "granular enough for much", but VideoSkip uses it?
            doTheFiltering();
        }

        // Displays a notice to comply with the United States Family Movie Act of 2005
        function displayLegalNotice() {
            console.log("display notice");
        
            var duplicateDisclaimer = document.querySelector(".family-movie-act-of-2005-disclaimer");
            if(duplicateDisclaimer) {
                duplicateDisclaimer.remove();
            }

            // Modified from both "content1.js" and "content2.js" from VideoSkip

            var performanceDisclaimer = document.createElement('span');
            performanceDisclaimer.className = "family-movie-act-of-2005-disclaimer";

            // Set styles
            performanceDisclaimer.style.display = "block";
            performanceDisclaimer.style.color = "white";
            performanceDisclaimer.style.fontFamily = "sans-serif";
            performanceDisclaimer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            performanceDisclaimer.style.fontSize = "large";
            performanceDisclaimer.style.textAlign = "center";
            performanceDisclaimer.style.zIndex = myVideo.style.zIndex + 1 | 1;
            performanceDisclaimer.style.position = "absolute";
            performanceDisclaimer.style.top = (myVideo.offsetTop + (myVideo.offsetHeight * 0.75)) + "px";
            performanceDisclaimer.style.left = (myVideo.offsetLeft + 10) + "px";
            performanceDisclaimer.style.width = (myVideo.offsetWidth - 20) + "px";

            myVideo.parentNode.insertBefore(performanceDisclaimer, myVideo);
            var performanceDisclaimerText = document.createTextNode(chrome.i18n.getMessage("legalNotice"));
            performanceDisclaimer.appendChild(performanceDisclaimerText);

            setTimeout(function() {
                performanceDisclaimer.style.visibility = "hidden";
            }, 6000);
        }

        if(activeCuts.length > 0) {
            displayLegalNotice();
        }

        var myVideoSrc = myVideo.src;
        var oldVideoSrc = myVideoSrc;

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema (refreshVideoElement)
        function checkIfVideoElementChanged() {
            oldVideoSrc = myVideoSrc;
            var newVideo = findFirstVideoTagOrNull();
            if(newVideo) {
                myVideoSrc = newVideo.src || myVideoSrc; // Short-circuit evaluation, so it won't be assigned an empty string (prevents uneeded code execution below)
            }
            if(oldVideoSrc != myVideoSrc) {
                console.log("video element changed");
                checkForTimeIndicator(); // To help with consistent video timing
                if(!myVideo.ontimeupdate) {
                    myVideo.ontimeupdate = function() { // The timeupdate event needs to be set again when a new video is found
                        doTheFiltering();
                    }
                }
                displayLegalNotice();
            }
        }
        
        if(isThisAmazon() || isThisIMDbTV()) {
            setInterval(checkIfVideoElementChanged, 1000); // Only once per second is enough, based on Sensible Cinema (also saves bandwidth)
        }
    }

    function checkPreferencesID() {
        chrome.storage.sync.get(['mcfPrefsID'], function(result) {
            var validatedID = validateIDInput(result.mcfPrefsID);
            if(validatedID != null) {
                applyFilters(validatedID);
            }
        });
    }

    // Function derived and modified from "contentscript.js" from Sensible Cinema
    var interval = setInterval(function() {
        myVideo = findFirstVideoTagOrNull();
        if (myVideo != null) {
            console.log("found video tag");
            clearInterval(interval);
            checkPreferencesID();
        }
    }, 50); // initial delay 50ms but me thinks not too bad, still responsive enough :)
}

// Check if the user has enabled filters in the extension popup (see popup.html and popup.js)
function checkIfFiltersEnabled() {
    chrome.storage.sync.get(['mcfFilterOn'], function(result) {
        if(result.mcfFilterOn == true) {
            if(filterScriptAlreadyRunning == false) {
                filterScript();
            } 
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message == "set_filter_actions") {
            checkIfFiltersEnabled();
        }
        if(request.message == "filter_checkbox_changed") {
            checkIfFiltersEnabled();
        }
    }
);

checkIfFiltersEnabled();


/* Next To-dos: 
* Test seeking within skip annotations and maybe overlapping annotations later
* Run filter script only if filters are available for the specific video
*/