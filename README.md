# Movie Content Filter Extension
Browser extension project for Movie Content Filter, to allow users to skip objectionable content on streaming services, based on their preferences.

Project Source Code Link: https://github.com/jacob-willden/movie-content-filter-extension/

Movie Content Filter Website: https://www.moviecontentfilter.com/

## General Information
This project is in very early development right now, and there are many features to add (and some bugs to fix). It is built on the source code from the open-source VideoSkip and Play It My Way extensions (linked below). The source code is freely available to copy and build on, released under the GNU General Public License (GNU GPL).

VideoSkip Source Code Link: https://github.com/fruiz500/VideoSkip-extension/

Play It My Way Source Code Link: https://github.com/rdp/sensible-cinema/

Currently the extension is for Firefox and Chromium browsers (such as Google Chrome, Microsoft Edge, Opera, Vivaldi, and Brave). Support is being added first for Amazon Video, Netflix, Disney Plus, Hulu, and Apple TV Plus, with the hope to expand later to other streaming services.

## Installation Instructions (for testing purposes)

Chromium Browsers

1. Download the repository and extract the ZIP file
2. Go to the Extensions area of your browser and make sure "Developer mode" is on
3. Click the "Load unpacked" button
4. Select the "movie-content-filter-browser-extension" folder inside the "movie-content-filter-extension" folder

Firefox

1. Download the repository and extract the ZIP file
2. Enter "about:debugging" into the address bar and click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the "manifest.json" file inside the "movie-content-filter-browser-extension" folder inside the "movie-content-filter-extension" folder

(For Firefox Testing: Since Firefox can only install unsigned extensions as temporary add-ons, you will need to reload the extension each time you restart the browser, and you will need to recheck the box to enable filters and enter a preferences ID in the extension popup.)

## Browser Requirements

Chrome: Version 55 or newer

Microsoft Edge: Version 79 or newer

Firefox: Version 54 or newer

Opera: Version 42 or newer

Other Browsers (such as Vivaldi, Brave, and likely Kiwi, Samsung Internet, Firefox for Android, and others): Any version that supports ECMAScript 5 or newer, the `fetch` and `async` functions in JavaScript, and supports standard web extensions (including extension APIs such as storage, i18n (stands for internationalization), runtime, and tabs).

(If you would like to use the extension with an older version of these browsers or an unsupported browser, [submit an issue on Github](https://github.com/jacob-willden/movie-content-filter-extension/issues).)

Thanks to the [Can I Use](https://caniuse.com/) and [Mozilla Developer Network](https://developer.mozilla.org/) websites for browser compatibility information.

## Legal

The extension does not alter video files at all, but instead lets "users choose to see or not to see parts of the content, and the app remembers their choice" (quoted from the Read Me file for the VideoSkip extension [here](https://github.com/fruiz500/VideoSkip-extension/blob/master/README.md), which extension's code this extension is built on). It also does not enable unauthorized access to video files.

The streaming services that our extension supports and the content from these streaming services belong to their respective copyright holders. We claim no affliation or endorsement from any of these copyright holders.

Notice to All Users: When watching a motion picture (referring to a movie, television show, etc) using this extension, the performance of the motion picture is altered from the performance intended by the director or copyright holder of the motion picture.

Notice to Netflix Users: While this extension and its users are legally protected from liability under the United States Family Entertainment and Copyright Act of 2005, Netflix has a section in their Terms of Service that prohibits code insertion (section 4.6), without mentioning if code insertion is allowed for legal purposes, like filtering as allowed under the law. 

If the administrators of Netflix were to think that your use of this extension violates their Terms of Service, they could terminate your account. We find this scenario to be unlikely however, because this would only hurt the streaming service financially. In addition, there are larger, proprietary filtering services that support this streaming service (such as Clearplay, VidAngel, and Enjoy Movies Your Way) that have not faced this issue as far as we know. While we think it is unlikely that Netflix's administrators would take such action against their users, we wish to inform our users so they can make the decision themselves whether to filter (or not filter) content that is available through these services.
