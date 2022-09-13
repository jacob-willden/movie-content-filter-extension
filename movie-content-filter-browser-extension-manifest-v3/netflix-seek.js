// Netflix will crash with the normal seek instruction. Modified from code by Dmitry Paloskin at StackOverflow. Must be executed in page context
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