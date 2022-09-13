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
    Most Recent Date of Derivation/Modification: September 1, 2021

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

    function isThisNetflix() {
        return serviceName.includes('netflix');
    }

    function isThisAmazon() {
        return serviceName.includes('amazon'); // This includes any Amazon top-level domain or subdomain
    }

    function isThisAppleTV() {
        return serviceName.includes('apple');
    }

    function isThisHulu() {
        return serviceName.includes('hulu');
    }

    function isThisPluto() {
        return serviceName.includes('pluto');
    }

/*     function isThisYoutube() {
        if(serviceName.includes('youtube')) {
            return true;
        }
        else {
            return false;
        }
    } */

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

    function applyFilters(myPreferencesID, allCuts) {
        var activeCuts = [];

        var prevAction = '';

        // Determine which filter tags should be set, based on user preferences
        function setActions(userID) {
            console.log("setting filter actions");
            var myPreferences;
            for(var i = 0; i < userPrefs.length; i++) {
                if(userPrefs[i].id === userID) {
                    myPreferences = userPrefs[i];
                }
            }
            
            // Modified from isSkipped function from "videoskip.js" from VideoSkip
            activeCuts = allCuts.filter(function(tag) {
                return tag.severity >= myPreferences[tag.category];
            });
        }

        setActions(myPreferencesID);

        // Maybe add currentUrlNotIframe() function from "edited_generic_player.js" from Sensible Cinema later?
        // Definitely add blankScreenIfWithinHeartOfSkip() and some other functions below it later

        // From videoskip.js
        // hour:minute:second string to decimal seconds
        function fromHMS(timeString) {
            timeString = timeString.replace(/,/,".");			//in .srt format decimal seconds use a comma
            var time = timeString.split(":");
            if(time.length === 3) {							//has hours
                return parseInt(time[0])*3600 + parseInt(time[1])*60 + parseFloat(time[2]);
            }
            else if(time.length === 2){					//minutes and seconds
                return parseInt(time[0])*60 + parseFloat(time[1]);
            }
            else {											//only seconds
                return parseFloat(time[0]);
            }
        }

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

        var setForAdvertisement = false;

        // Function created by Jacob Willden
        function isWatchingAdvertisement() {
            if(isThisAmazon()) {
                if(document.querySelector(".atvwebplayersdk-adtimeindicator-text")) {
                    return true;
                }
            }
            if(isThisHulu()) {
                if(document.querySelector(".AdUnitView")) {
                    return true;
                }
            }
            if(isThisPluto()) {
                if(document.querySelector('[aria-label="Play"]').hasAttribute('disabled')) {
                    return true;
                }
            }
/*             if(isThisYoutube()) {
                if(document.querySelector(".ytp-ad-player-overlay")) return true;
            } */
            return false;
        }

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema (checkStatus)
        function checkForAdvertisement() {
            if(isWatchingAdvertisement()) {
                if(setForAdvertisement === false) {
                    setForAdvertisement = true;
                    // Ad is playing
                    console.log("ad just started");
                }
            }
            else {
                if(setForAdvertisement === true) {
                    setForAdvertisement = false;
                    // Ad is over, now you can check for truncatedActualDuration
                    console.log("ad just ended");
                }
            }
        }

        if(isThisAmazon() || isThisHulu() || isThisPluto() /* || isThisYoutube() */ ) { // If bringing back Youtube later, be sure to separate into a another if statement
            // If the video is on a website with video advertisements
            setInterval(checkForAdvertisement, 10);
            // Keep interval going in case there's another ad (for Amazon FreeVee, Hulu, and Youtube, may be able to clear it for Amazon?)
        }

        var timeIndicator = null;
        
        // Function source: https://www.includehelp.com/code-snippets/get-the-decimal-part-of-a-floating-number-in-javascript.aspx
        function getDecimalFromFloat(number) {
            return (number - Math.floor(number));
        }

        function checkForTimeIndicator() {
            var interval = setInterval(function() {
                timeIndicator = document.querySelector(".atvwebplayersdk-timeindicator-text");
                if((timeIndicator) && (timeIndicator.textContent.length > 6)) { // The div appears to have a non-breaking space (6 characters) before inserting the times. The duration difference is checked in getCurrentTime()
                    clearInterval(interval);
                }
            }, 100);
        }

        if(isThisAmazon()) {
            checkForTimeIndicator(); // To help with consistent video timing
        }

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema
        function getCurrentTime() {
            if(isThisAmazon()) { // Only works if all ads are integer lengths
                if(timeIndicator) {
                    var bothTimesArray = timeIndicator.textContent.split("/");
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

        // By Naveen at StackOverflow, we use it to execute seek on Netflix (derived from "content2.js" from VideoSkip)
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
            if(isThisNetflix()) { 
                // In case the user seeks within a skip (?)
                //myVideo.style.opacity = 0;
                //Netflix will crash with the normal seek instruction. Modified from code by Dmitry Paloskin at StackOverflow. Must be executed in page context
                executeOnPageSpace('videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;sessions = videoPlayer.getAllPlayerSessionIds();player = videoPlayer.getVideoPlayerBySessionId(sessions[sessions.length-1]);player.pause();player.seek(' + time*1000 + ');player.play();');
            }
            // Modified from "edited_generic_player.js" from Sensible Cinema
            else if(isThisAmazon()) {
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
                if(request.message === "set_filter_actions") {
                    //console.log("got set filter actions message:" + request.preferences);
                    chrome.storage.sync.get(['mcfPrefsID'], function(result) {
                        var validatedID = validateIDInput(result.mcfPrefsID);
                        if(validatedID) {
                            setActions(validatedID);
                        }
                    });
                }
                
                if(request.message === "filter_checkbox_changed") {
                    chrome.storage.sync.get(['mcfFilterOn'], function(result) {
                        if(result.mcfFilterOn === true) {
                            filtersEnabled = true;
                        }
                        else {
                            filtersEnabled = false;
                        }
                    });
                }

/*                 if(request.message === "request_current_time") {
                    var requestedCurrentTime = getCurrentTime();
                    sendResponse({myCurrentTime: requestedCurrentTime});
                }

                if(request.message === "request_filter_id_list") { // Probably unnecessary?
                    sendResponse({filterIDList: userPrefs});
                } */
            }
        );

        // Execute filters during playback, derived and modified from anonymous function in "content1.js" from VideoSkip (version 0.4.1), originally "content2.js"
        function doTheFiltering() { //apply skips to video when it gets to them. THIS IS THE HEART OF THE EXTENSION
            if(typeof(activeCuts) === "undefined" || !activeCuts || filtersEnabled === false || setForAdvertisement === true) {
                return;
            }
            var action = '', tempAction = '', startTime, endTime;
            for(var i = 0; i < activeCuts.length; i++) { //find out what action to take, according to timing and setting in activeCuts object
                startTime = activeCuts[i].startTime;
                endTime = activeCuts[i].endTime;
                if((getCurrentTime() > startTime) && (getCurrentTime() < endTime)) {
                    tempAction = activeCuts[i].action;
                } 
                else {
                    tempAction = '';
                }
                if(tempAction === 'skip') { //retain the strongest action valid for the current time. Hierarchy: skip > fast > blank > blur > mute
                    action = 'skip';
                    break; //can't get any stronger, so stop looking for this time
                }
                else if(tempAction === 'fast') {
                    action = (action === 'skip') ? 'skip' : 'fast';
                }
                else if(tempAction === 'blank') {
                    action = ((action === 'skip') || (action === 'fast')) ? action : tempAction;
                }
                else if(tempAction === 'blur') {
                    action = ((action === 'skip') || (action === 'fast') || (action === 'blank')) ? action : tempAction; //may include position for local blur (if added)
                }
                else if(tempAction === 'mute') {
                    action = ((action === 'skip') || (action === 'fast')) ? action : (((action === 'blank') || (action === 'blur')) ? 'skip' : 'mute');
                }
            }

/*             if(action == 'mute'){				//mute/unmute subtitles regardless of previous action, in case the subs element changes in the middle of the interval
                blankSubs(true)
            }else if(action != 'mute'){		//reset to normal
                blankSubs(false)
            } */

            if(action === prevAction) { //only apply action to the Document Object Model (DOM) if there's a change
                return;
            } 
            else if(action === 'skip') { //skip range
                console.log("skipping from: " + getCurrentTime());
                goToTime(endTime);
            } 
            else if(action === 'blank') { //blank screeen
                console.log("blanking: " + getCurrentTime());
                myVideo.style.opacity = 0;
            }
            else if(action === 'blur') { //blur screeen
                console.log("blurring: " + getCurrentTime());
                myVideo.style.filter =  'blur(30px)';
            }
            else if(action === 'fast') { //fast forward
                console.log("fast forwarding from: " + getCurrentTime());
                myVideo.playbackRate = 16;
            }
            else if(action === 'mute') { //mute sound (and subtitles?)
                console.log("muting: " + getCurrentTime());
                myVideo.muted = true;
            } 
            else { //back to normal
                // Check if videoNotBuffering (or for seek event) before unhiding video?
                myVideo.style.opacity =  '';
                myVideo.style.filter = '';
                myVideo.playbackRate = 1;
                myVideo.muted = false;
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
            performanceDisclaimer.style.position = "fixed";
            performanceDisclaimer.style.top = "35%";
            performanceDisclaimer.style.left = "10px";
            performanceDisclaimer.style.width = "calc(100% - 20px)";

            myVideo.parentNode.insertBefore(performanceDisclaimer, myVideo);
            var performanceDisclaimerText = document.createTextNode(chrome.i18n.getMessage("legalNotice"));
            performanceDisclaimer.appendChild(performanceDisclaimerText);

            setTimeout(function() {
                performanceDisclaimer.style.color = 'rgba(0, 0, 0, 0)';
                performanceDisclaimer.style.backgroundColor = 'rgba(0, 0, 0, 0)';
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
            if(oldVideoSrc !== myVideoSrc) {
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
        
        if(isThisAmazon()) {
            setInterval(checkIfVideoElementChanged, 1000); // Only once per second is enough, based on Sensible Cinema (also saves bandwidth)
        }
    }

    function getFilters(myPreferencesID) {
        console.log("getting allCuts");
        var filterFileURL = chrome.runtime.getURL("sample-filter-file.json");

        fetch(filterFileURL).then(function(response) {
            if(!response.ok) {
                throw new Error("Network response returned code " + response.status);
            }
            return response.json();
        }).then(function(allCuts) {
            applyFilters(myPreferencesID, allCuts);
        }).catch(function(error) {
            console.log("Filter file fetch failed: " + error);
        });
    }

    function checkPreferencesID() {
        chrome.storage.sync.get(['mcfPrefsID'], function(result) {
            var validatedID = validateIDInput(result.mcfPrefsID);
            if(validatedID) {
                getFilters(validatedID);
            }
        });
    }

    // Function derived and modified from "contentscript.js" from Sensible Cinema
    var interval = setInterval(function() {
        myVideo = findFirstVideoTagOrNull();
        if(myVideo) {
            console.log("found video tag");
            clearInterval(interval);
            checkPreferencesID();
        }
    }, 50); // initial delay 50ms but me thinks not too bad, still responsive enough :)
}

// Check if the user has enabled filters in the extension popup (see popup.html and popup.js)
function checkIfFiltersEnabled() {
    chrome.storage.sync.get(['mcfFilterOn'], function(result) {
        //console.log("got result back: " + result.mcfFilterOn);
        if(result.mcfFilterOn !== false) { // Needs to check for not false (instead of true) in case the user hasn't opened the popup since install (and therefore hasn't set the filter toggle variable in storage)
            if(filterScriptAlreadyRunning === false) {
                filterScript();
            }
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === "set_filter_actions") {
            checkIfFiltersEnabled();
        }
        if(request.message === "filter_checkbox_changed") {
            checkIfFiltersEnabled();
        }
    }
);

checkIfFiltersEnabled();


/* Future To-dos:
* Maybe implement hiding the video while seeking?
* Run filter script only if filters are available for the specific video (once the website API is available)
* Add promise error handling?
* All frames for executeScript throws errors occassionally (probably need to check URL)
* Specify extension authors?
*/