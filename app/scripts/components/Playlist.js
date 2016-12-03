/*********************************
 *
 * Playlist Module
 *
 *********************************/

var Playlist = (function() {

  var _currentPlaylist = [],
    _currentPlaylistInc = 0,
    _numWithoutComments = 0,
    _killSwitch = false;

  var nextVid = function() {
    if (_currentPlaylist.length && !_killSwitch) {
      // console.log();
      _currentPlaylistInc = (_currentPlaylistInc < _currentPlaylist.length - 1) ? _currentPlaylistInc += 1 : 0;

      if (_currentPlaylist[_currentPlaylistInc].id.videoId) {
        catbSettings.currentVid = _currentPlaylist[_currentPlaylistInc].id.videoId;
      } else {
        catbSettings.currentVid = _currentPlaylist[_currentPlaylistInc].id;
      }

      YouTubeData.doMainQuery('id');
    }

  };

  var incrementNoComments = function() {
    _numWithoutComments++;

    if(_numWithoutComments === _currentPlaylist.length) {
      console.log('NO VIDEOS IN THIS PLAYLIST HAVE COMMENTS !!!!!!!!!!!!!!! ');
      _killSwitch = true;
      Modals.toggleModal('None of the videos in this playlist have comments! BORING. Go ahead and try something else.');
    }
  };

  var setCurrent = function(obj) {
    _currentPlaylist = obj;
    _currentPlaylistInc = 0;
    _numWithoutComments = 0;
    _killSwitch = false;
  };

  var getCurrent = function() {
    return _currentPlaylist;
  };

  return {
    nextVid: nextVid,
    incrementNoComments: incrementNoComments,
    setCurrent: setCurrent,
    getCurrent: getCurrent
  };

})();
