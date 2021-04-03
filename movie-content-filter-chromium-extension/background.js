/*
    @source: https://github.com/jacob-willden/movie-content-filter-extension/

    @licstart  The following is the entire license notice for the
    code in this page.

    This file is part of the Movie Content Filter Browser Extension Project.

    Movie Content Filter Browser Extension Project Copyright (C) 2020 Jacob Willden

    "Movie Content Filter" Website Copyright (C) delight.im
    Website Link: https://www.moviecontentfilter.com/

    The Movie Content Filter Browser Extension Project is free software: 
    you can redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The project is distributed WITHOUT ANY WARRANTY;
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
    code in this page.
*/

// From Natalie Chouinard on Stack Overflow
// Source: https://stackoverflow.com/questions/20865581/chrome-extension-content-script-not-loaded-until-page-is-refreshed
chrome.webNavigation.onHistoryStateUpdated.addListener(function() {
    chrome.tabs.executeScript(null,{file:"content.js"});
}); // This is so the user doesn't need to refresh the page for the content script to run