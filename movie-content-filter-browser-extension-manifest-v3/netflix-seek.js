// Netflix will crash with the normal seek instruction. Must be executed in page context. Modified from code by Dmitry Paloskin (DimaOverflow) at StackOverflow
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