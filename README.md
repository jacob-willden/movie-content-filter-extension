# movie-content-filter-extension
Browser extension project for Movie Content Filter, to allow users to skip objectionable content on streaming services, based on their preferences.

This project is in very early development right now, and there are many features to add (and some bugs to fix). Currently the extension is for Firefox and Chromium browsers (such as Google Chrome, Microsoft Edge, Opera, Vivaldi, and Brave). Support is being added first for Amazon Video, Netflix, Disney Plus, Hulu, and Apple TV Plus, with the hope to expand later to other streaming services. The project is built on the source code from the open-source VideoSkip and Play It My Way extensions (linked below).

The extension does not alter video files at all, but instead lets "users choose to see or not to see parts of the content, and the app remembers their choice" (quoted from the Read Me file for the VideoSkip extension [here](https://github.com/fruiz500/VideoSkip-extension/blob/master/README.md)). It also does not enable unauthorized access to video files.

Movie Content Filter Website: https://www.moviecontentfilter.com/

The source code is freely available to copy and build on, released under the GNU General Public License (GNU GPL). It is linked below, along with the source code for VideoSkip and Play It My Way, which this project is built on:

Project Source Code Link: https://github.com/jacob-willden/movie-content-filter-extension/

VideoSkip Source Code Link: https://github.com/fruiz500/VideoSkip-extension/

Play It My Way Source Code Link: https://github.com/rdp/sensible-cinema/

Extension Installation Instructions for Chromium Browsers (for testing purposes)

1. Download the repository and extract the ZIP file

2. Go to the Extensions area of your browser and make sure "Developer mode" is on

3. Click the "Load unpacked" button

4. Select the "movie-content-filter-browser-extension" folder inside the "movie-content-filter-extension" folder

Extension Installation Instructions for Firefox (for testing purposes)

1. Download the repository and extract the ZIP file

2. Enter "about:debugging" into the address bar and click "This Firefox"

3. Click "Load Temporary Add-on"

4. Select the "manifest.json" file inside the "movie-content-filter-browser-extension" folder inside the "movie-content-filter-extension" folder

(For Firefox Testing: Since Firefox can only install unsigned extensions as temporary add-ons, you will need to reload the extension each time you restart the browser, and you will need to recheck the box to enable filters and enter a preferences ID in the extension popup.)

Notice to Netflix and Hulu Users: While this extension and its users are legally protected from liability under the United States Family Entertainment and Copyright Act of 2005, there are clauses in the Terms of Service for Netflix and Hulu that forbid the modification of their content (section 4.6 and section 3.4a respectively). We are not sure if filtering would be considered modification of their content or not (though we interpret it as the modification of the performance of the content rather than modification of the content itself). Netflix also has a section in their Terms of Service that prohibits code insertion (section 4.6), without mentioning if code insertion is allowed for legal purposes, such as filtering.

If the owners of any of these streaming services were to think that your use of this extension violates their Terms of Service, they could terminate your account. We find this scenario to be unlikely however, because this would only hurt the streaming services financially. In addition, there are larger, proprietary filtering services that support these streaming services, such as Clearplay and Enjoy Movies Your Way, that have not faced this issue as far as we know. While we think it is unlikely that these streaming services would take such action against their users, we wish to inform our users so they can make the decision themselves whether to filter (or not filter) content that is available through these services.