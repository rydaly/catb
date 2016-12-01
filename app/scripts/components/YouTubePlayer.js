/*********************************
 *
 *  YouTube Player Module
 *
 *********************************/


var YouTubePlayer = (function() {

  var _player = null,
    playerDiv;

  var initAPI = function() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  };

  var initPlayer = function() {
    return new Promise(function(resolve, reject) {

      _player = new YT.Player('player', {
        width: '1280',
        height: '720',
        videoId: catbSettings.currentVid, // defaults to app setting
        playerVars: {
          'controls': 0,
          'disablekb': 1,
          'enablejsapi': 1,
          'fs': 0,
          'loop': 1,
          'modestbranding': 1,
          'playsinline': 1,
          'showinfo': 0,
          'showsearch': 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });

      function onPlayerReady(e) {
        playerDiv = $('#player');

        if (catbSettings.isMobile) {
          playerDiv.fadeIn('fast');
        } else {
          playerDiv.fadeIn('fast'); // TODO :: need to consolidate this type of thing
        }

        e.target.setVolume(15);
        resolve('YT Player Ready');
      }

      function onPlayerStateChange(e) {
        if (e.data === YT.PlayerState.ENDED) {
          e.target.playVideo(); // loop video
        } else if (e.data === YT.PlayerState.PLAYING) {
          catbSettings.els.commentsOverlay.css('display', 'flex');
          playerDiv.fadeIn('fast');
        }
      }

      function onPlayerError(e) {
        reject('YT Player Failed');
      }

    });

  };

  var loadVideo = function(id) {
    _player.loadVideoById(id);
  };

  var playVideo = function() {
    _player.playVideo();
  };

  var stopVideo = function() {
    _player.stopVideo();
  };

  return {
    initAPI: initAPI,
    initPlayer: initPlayer,
    loadVideo: loadVideo,
    playVideo: playVideo,
    stopVideo: stopVideo
  };

})();
