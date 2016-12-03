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

      // loop playlist
      if(_currentPlaylistInc < _currentPlaylist.length - 1) {
        _currentPlaylistInc++;
      } else {
        _currentPlaylistInc = 0;
      }

      // handle differing results from YT api queries
      if (_currentPlaylist[_currentPlaylistInc].id.videoId) {
        catbSettings.setCurrent(_currentPlaylist[_currentPlaylistInc].id.videoId);
      } else {
        catbSettings.setCurrent(_currentPlaylist[_currentPlaylistInc].id);
      }

      // get next vid
      YouTubeData.doMainQuery('id');
    }

  };

  var incrementNoComments = function() {
    _numWithoutComments++;

    if(_numWithoutComments === _currentPlaylist.length) {
      _killSwitch = true;
      _numWithoutComments = 0;
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
