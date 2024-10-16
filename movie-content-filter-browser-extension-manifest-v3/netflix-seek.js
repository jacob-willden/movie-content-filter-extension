/*
    @source: https://github.com/jacob-willden/movie-content-filter-extension/

    @licstart  The following is the entire license notice for the
    JavaScript code in this page.

    This file is part of the Movie Content Filter Browser Extension Project.

    Movie Content Filter Browser Extension Project Copyright (C) 2020, 2021 Jacob Willden
    (Released under the GNU General Public License (GNU GPL) Version 3.0 or later)

    Most of the code below is provided by users from StackOverflow, and
    is explicitly stated as so. Such code is released under either the
    Creative Commons Attribution Share-Alike (CC BY-SA) 3.0 or 4.0. I
    specify Creative Commons as my proxy to make the contributions
    from StackOverflow compatible with future versions of the GPL.

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

// Netflix will crash with the normal seek instruction. Must be executed in page context. Modified from code by Dmitry Paloskin (DimaOverflow) on StackOverflow (CC BY-SA 3.0)
// https://stackoverflow.com/questions/42105028/netflix-video-player-in-chrome-how-to-seek
(function() {
    let videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
    let sessions = videoPlayer.getAllPlayerSessionIds();
    let player = videoPlayer.getVideoPlayerBySessionId(sessions[sessions.length-1]);
    let time = document.querySelector('meta[name="mcf-skip-time"]').getAttribute('content');
    if(time) {
        player.pause();
        player.seek(time * 1000);
        player.play();
    }
})();