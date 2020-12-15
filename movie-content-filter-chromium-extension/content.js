/*
    @source: https://github.com/jacob-willden/movie-content-filter-extension/
    @source: https://github.com/fruiz500/VideoSkip-extension/
    @source: https://github.com/rdp/sensible-cinema/

    @licstart  The following is the entire license notice for the
    JavaScript code in this page.

    This file is part of the Movie Content Filter Browser Extension Project.
    
    Copyright (C) 2020 Jacob Willden

    Most of the code below was derived and modified from several source 
    code files in the VideoSkip extension repository (source link above), 
    including "content1.js", "content2.js", and "videoskip.js". 
    Various other parts of the code below were derived and modified from 
    the "edited_generic_player.js" and "contentscript.js" source code 
    files in the "chrome_extension" folder in the "html5_javascript" 
    folder from the Sensible Cinema (Play It My Way) repository 
    (source link above), and they are explicitly labled as so.

    VideoSkip Source Code Copyright (C) 2020 Francisco Ruiz
    (Released Under the GNU General Public License (GNU GPL))
    Sensible Cinema (Play It My Way) Source Code Copyright (C) 2016, 2017, 2018 Roger Pack 
    (Released Under the Lesser General Public License (LGPL))

    Afformentioned source code derived and modified by Jacob Willden
    Start Date of Derivation/Modification: November 20, 2020

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

function filterScript() {

    console.log("starting content script");
    var myVideo = null;
    var serviceName = window.location.hostname;

    // Function derived and modified from "edited_generic_player.js" from Sensible Cinema
    function findFirstVideoTagOrNull() {
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

    function applyFilters() {
        console.log("fetching cuts");
        var cuts = [ // Some dummy values for now
            {"startTime": 40, "endTime": 42, "category": "gambling", "severity": 1, "action": "mute", "enabled": true},
            {"startTime": 47, "endTime": 49, "category": "gambling", "severity": 1, "action": "blank", "enabled": true},
            {"startTime": 54, "endTime": 56, "category": "gambling", "severity": 1, "action": "skip", "enabled": true},
            {"startTime": 61, "endTime": 63, "category": "tedious", "severity": 2, "action": "mute", "enabled": true},
            {"startTime": 68, "endTime": 70, "category": "tedious", "severity": 2, "action": "blank", "enabled": true},
            {"startTime": 75, "endTime": 77, "category": "tedious", "severity": 2, "action": "skip", "enabled": true},
            {"startTime": 82, "endTime": 84, "category": "warfare", "severity": 3, "action": "mute", "enabled": true},
            {"startTime": 89, "endTime": 91, "category": "warfare", "severity": 3, "action": "blank", "enabled": true},
            {"startTime": 96, "endTime": 98, "category": "warfare", "severity": 3, "action": "skip", "enabled": true}
        ];
        //for(var i = 0; i < cuts.length; i++) {
        //    console.log(cuts[i]);
        //}

        var userPrefs = [ // dummy values for now
            {"id": "PmrqC", "gambling": 3, "tedious": 2, "warfare": 1},
            {"id": "ghBnb", "gambling": 0, "tedious": 1, "warfare": 0},
            {"id": "T3GDJ", "gambling": 3, "tedious": 3, "warfare": 3}
        ];

        var prevAction = '';

        // Function modified from isSkipped function from "videoskip.js" from VideoSkip
        function isTagApplied(myPreferences, tagCategory, tagSeverity) { 
            return (tagSeverity + myPreferences[tagCategory] > 3);
        }

        // Determine which filter tags should be set, based on user preferences
        function setActions(userID) {
            for(var i = 0; i < userPrefs.length; i++) {
                if(userPrefs[i].id == userID) {
                    var myPreferences = userPrefs[i];
                }
            }
            
            for(var i = 0; i < cuts.length; i++) {
                cuts[i].enabled = isTagApplied(myPreferences, cuts[i].category, cuts[i].severity) ? true : false;
            }

            for(var i = 0; i < cuts.length; i++) { // for testing
                console.log(cuts[i]);
            }
        }

        // Displays a notice to comply with the United States Family Movie Act of 2005
        function displayLegalNotice() {
            // Modified from both content1.js and content2.js

            var performanceDisclaimerArea = document.createElement('span');

            // Set styles
            performanceDisclaimerArea.style.display = "block";
            performanceDisclaimerArea.style.color = "white";
            performanceDisclaimerArea.style.fontFamily = "sans-serif";
            performanceDisclaimerArea.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            performanceDisclaimerArea.style.fontSize = "large";
            performanceDisclaimerArea.style.textAlign = "center";
            performanceDisclaimerArea.style.zIndex = myVideo.style.zIndex + 1 | 1;
            performanceDisclaimerArea.style.position = 'absolute';
            performanceDisclaimerArea.style.top = (myVideo.offsetTop + (myVideo.offsetHeight * 0.75)) + 'px';
            performanceDisclaimerArea.style.left = (myVideo.offsetLeft + 10) + 'px';
            performanceDisclaimerArea.style.width = (myVideo.offsetWidth - 20) + "px";

            myVideo.parentNode.insertBefore(performanceDisclaimerArea, myVideo);
            var performanceDisclaimerText = document.createTextNode("Notice: The performance of the motion picture is altered from the performance intended by the director or copyright holder of the motion picture.");
            performanceDisclaimerArea.appendChild(performanceDisclaimerText);

            setTimeout(function() {
                performanceDisclaimerArea.style.visibility = 'hidden';
            }, 6000);
        }

        // Maybe add currentUrlNotIframe() function from "edited_generic_player.js" from Sensible Cinema later?
        // Definitely add blankScreenIfWithinHeartOfSkip() and some other functions below it later

        function isThisAmazon() {
            if(serviceName.includes('.amazon.')) { // This includes any Amazon top-level domain or subdomain
                return true;
            }
            else {
                return false;
            }
        }

        // Function derived from "edited_generic_player.js" from Sensible Cinema
        function isAmazonTenSecondsOff() {
            // the new way has both webPlayerContainer and webPlayerUIContainer, old lacks latter [and is 10s off]
            var x = document.getElementsByClassName("webPlayerUIContainer");
            if (x.length > 0) {
                return false; // new
            } 
            else {
                return true; // old
            }
        }

        // Function derived and modified from "edited_generic_player.js" from Sensible Cinema
        function getCurrentTime() {
            if(isThisAmazon() == true) {
                if (isAmazonTenSecondsOff()) {
                    return myVideo.currentTime - 10; // not sure why they did this :|
                } 
                else {
                    return myVideo.currentTime;
                }
            } 
            else {
                return myVideo.currentTime;
            }
        }

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

        //moves play to requested time
        function goToTime(time) {
            if(serviceName == 'www.netflix.com') { //Netflix will crash with the normal seek instruction. By Dmitry Paloskin at StackOverflow. Must be executed in page context
                executeOnPageSpace('videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;sessions = videoPlayer.getAllPlayerSessionIds();player = videoPlayer.getVideoPlayerBySessionId(sessions[sessions.length-1]);player.seek(' + time*1000 + ')');
            }
            // Modified from "edited_generic_player.js" from Sensible Cinema
            if(isThisAmazon() == true) {
                if (isAmazonTenSecondsOff()) {
                    myVideo.currentTime = time + 10;
                } 
                else {
                    myVideo.currentTime = time;
                }
            } 
            else { //everyone else is HTML5 compliant
                myVideo.currentTime = time;
            }
        }

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if(request.message == "set_filter_actions") {
                    //console.log("got set filter actions message:" + request.preferences);
                    setActions(request.userID);
                }
            }
        );

        // Probably unnecessary
/*         chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if(request.message == "request_filter_id_list") {
                    sendResponse({filterIDList: userPrefs});
                }
            }
        ); */

        chrome.storage.sync.get(['mcfPrefsID'], function(result) {
            if(typeof(result.mcfPrefsID) === 'string') {
                setActions(result.mcfPrefsID);
            }
        });

        // if enabled tags > 0?
        displayLegalNotice();

        //to skip video during playback, also collect data for auto sync
        myVideo.ontimeupdate = function() {
            var action = '', startTime, endTime;
            for(var i = 0; i < cuts.length; i++) { //find out what action to take, according to timing and setting in cuts object
                startTime = cuts[i].startTime;
                endTime = cuts[i].endTime;
                if((getCurrentTime() > startTime) && (getCurrentTime() < endTime)) {
                    if(cuts[i].enabled == true) {
                        action = cuts[i].action;
                        break;
                    }
                } 
                else {
                    action = '';
                }
            }
            if(action == prevAction) { //only apply action to the Document Object Model (DOM) if there's a change
                return;
            } 
            else if(action == 'skip') {
                console.log("skipping");
                goToTime(endTime);
            } 
            else if(action == 'blank') {
                console.log("blanking");
                myVideo.style.opacity = 0;
            } 
            else if(action == 'mute') {
                console.log("muting");
                myVideo.muted = true;
                // if(myVideo.textTracks.length > 0) myVideo.textTracks[0].mode = 'disabled';
            } 
            else {
                myVideo.style.opacity =  '';
                myVideo.muted = false;
                // if(myVideo.textTracks.length > 0) myVideo.textTracks[0].mode = 'showing';
            }
            prevAction = action;
        }
    }

    // Function derived and modified from "contentscript.js" from Sensible Cinema
    var interval = setInterval(function() {
        myVideo = findFirstVideoTagOrNull();
        if (myVideo != null) {
            console.log("found video tag");
            clearInterval(interval);
            console.log("running applyFilters function now");
            applyFilters();
        }
    }, 50); // initial delay 50ms but me thinks not too bad, still responsive enough :)

}

// Check if the user has enabled filters in the extension popup (see popup.html and popup.js)
chrome.storage.sync.get(['mcfFilterOn'], function(result) {
    if(result.mcfFilterOn == true) {
        filterScript();
    }
});


/* Next Todos: 
* Why is Amazon buffer different than 10 seconds (Advertisements before videos? Check Sensible Cinema)
* Check if extension reloads when going to a different episode on Amazon (checkIfEpisodeChanged function?)
* Troubleshoot Netflix crashing when the user scrubs to inside a skip
* Add i_muted_it and i_hid_it variables from Sensible Cinema (probably video_ever_initialized too)
* Ensure that "the technology provides a clear and conspicuous notice at 
the beginning of each performance that the performance of the motion 
picture is altered from the performance intended by the director or 
copyright holder of the motion picture" (United States Family Movie Act of 2005),
and only if filters are available for the specific video
* Roger Pack says timeupdate isn't "granular enough for much", but VideoSkip uses it?
*/