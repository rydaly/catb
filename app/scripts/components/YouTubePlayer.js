/*********************************
 *
 *  YouTube Player Module
 *
 *********************************/

var YouTubePlayer = (function() {

  var _player = null,
    _playerDiv;

  var videoStartedEvent = new CustomEvent('videoStarted', {
    'detail': ''
  });

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
        _playerDiv = $('#player');

        if (catbSettings.isMobile) {
          _playerDiv.fadeIn('fast');
        } else {
          _playerDiv.fadeIn('fast'); // TODO ??
        }

        e.target.setVolume(15);
        resolve('YT Player Ready');
      }

      function onPlayerStateChange(e) {
        switch (e.data) {
          case YT.PlayerState.BUFFERING :
            _player.isBuffered = false;
            break;
          case YT.PlayerState.PLAYING :
            // will not fire when video loops
            if(!_player.isBuffered) {
              _player.isBuffered = true;
              showPlayer();
              window.dispatchEvent(videoStartedEvent);
            }
            break;
          case YT.PlayerState.ENDED :
            e.target.seekTo(0);
            break;
        }
      }

      function onPlayerError(e) {
        reject('YT Player Failed');
      }

    });

  };

  var showPlayer = function() {
    _playerDiv.addClass('show').removeClass('hide');
    Catb.domEls.commentsOverlay.addClass('show').removeClass('hide');
    Catb.domEls.videoOverlay.addClass('hide').removeClass('show');
  };

  var hidePlayer = function() {
    _playerDiv.addClass('hide').removeClass('show');
    Catb.domEls.commentsOverlay.addClass('hide').removeClass('show');
    Catb.domEls.videoOverlay.addClass('show').removeClass('hide');
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
    hidePlayer: hidePlayer,
    showPlayer: showPlayer,
    loadVideo: loadVideo,
    playVideo: playVideo,
    stopVideo: stopVideo
  };

})();
