/*
    Movie Content Filter Browser Extension Project
    By Jacob Willden

    @source: https://github.com/jacob-willden/movie-content-filter-extension/
    @source: https://github.com/fruiz500/VideoSkip-extension/
    @source: https://github.com/rdp/sensible-cinema/

    "Movie Content Filter" Website Copyright (C) delight.im
    Website Link: https://www.moviecontentfilter.com/

    @licstart  The following is the entire license notice for the
    JavaScript code in this page.

    Most of the code below was derived and modified from several source 
    code files in the VideoSkip extension repository (source link above), 
    including "content1.js", "content2.js", and "videoskip.js". 
    Basically the rest of the code below was derived and modified from 
    the "edited_generic_player.js" and "contentscript.js" source code 
    files in the "chrome_extension" folder in the "html5_javascript" 
    folder from the Sensible Cinema (Play It My Way) repository 
    (source link above).

    VideoSkip Source Code Copyright (C) 2020 Francisco Ruiz
    (Released Under the GNU General Public License (GNU GPL))
    Sensible Cinema (Play It My Way) Source Code Copyright (C) 2016, 2017, 2018 Roger Pack 
    (Released Under the Lesser General Public License (LGPL))

    Source code modified and derived by Jacob Willden
    Date of Derivation/Modification: November 20, 2020

    The JavaScript code in this page is free software: you can
    redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The code is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    that code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.

    @licend  The above is the entire license notice
    for the JavaScript code in this page.
*/

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
    cuts = [ // Some dummy values for now
        {"startTime": 40, "endTime": 42, "category": "", "severity": "", "action": "mute"},
        {"startTime": 47, "endTime": 49, "category": "", "severity": "", "action": "blank"},
        {"startTime": 54, "endTime": 56, "category": "", "severity": "", "action": "skip"}
    ];
    for(var i = 0; i < cuts.length; i++) {
        console.log(cuts[i]);
    }

    // Maybe add currentUrlNotIframe() function from "edited_generic_player.js" from Sensible Cinema later?

    var prevAction = '';
    // var switches = [];

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
        if (serviceName == 'www.amazon.com' || serviceName == 'smile.amazon.com') {
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
        if (serviceName == 'www.amazon.com' || serviceName == 'smile.amazon.com') {
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

    //to skip video during playback, also collect data for auto sync
    myVideo.ontimeupdate = function() {
        var action = '', startTime, endTime;
        for(var i = 0; i < cuts.length; i++) { //find out what action to take, according to timing and setting in cuts object
            startTime = cuts[i].startTime;
            endTime = cuts[i].endTime;
            if((getCurrentTime() > startTime) && (getCurrentTime() < endTime)) {
                action = cuts[i].action;
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


/* Next Todos: 
* Why is Amazon buffer different than 10 seconds (Advertisements before videos? Check Sensible Cinema)
* Check if extension reloads when going to a different episode on Amazon
* Troubleshoot Netflix crashing when the user scrubs to inside a skip
* Add i_muted_it and i_hid_it variables from Sensible Cinema (probably video_ever_initialized too)
* Add localization matches for Amazon URLs (e.g. amazon.co.uk or amazon.de)
* Ensure that "the technology provides a clear and conspicuous notice at 
the beginning of each performance that the performance of the motion 
picture is altered from the performance intended by the director or 
copyright holder of the motion picture" (United States Family Movie Act of 2005)
*/