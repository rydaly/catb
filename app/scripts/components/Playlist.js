/*********************************
 *
 * Playlist Module
 *
 *********************************/

var Playlist = (function() {
  var _currentPlaylist = [],
    _currentPlaylistInc = 0;

  var nextVid = function() {
    // console.log('CURRENT PLAYLIST :: ', _currentPlaylist);
    if(_currentPlaylist.length) {
      // console.log('nextVid CURRENT :: ', _currentPlaylist[_currentPlaylistInc]);
      _currentPlaylistInc = (_currentPlaylistInc < _currentPlaylist.length - 1) ? _currentPlaylistInc += 1 : 0;

      if(_currentPlaylist[_currentPlaylistInc].id.videoId) {
        catbSettings.currentVid = _currentPlaylist[_currentPlaylistInc].id.videoId;
      } else {
        catbSettings.currentVid = _currentPlaylist[_currentPlaylistInc].id;
      }

      YouTubeData.doMainQuery('id');
    }
    // console.log('CURRENT LIST :: ', _currentPlaylist);
    // console.log('DEFAULT LIST :: ', _defaultPlaylist);
    // console.log('CURRENT INC :: ', _currentPlaylistInc);
  };

  var setCurrent = function(obj) {
    console.log('SET CURRENT :: ', obj);
    _currentPlaylist = obj;
  };

  var getCurrent = function() {
    return _currentPlaylist;
  };

  return {
    nextVid: nextVid,
    setCurrent: setCurrent,
    getCurrent: getCurrent
  }
})();
