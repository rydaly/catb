/*********************************
 *
 * Router Module
 *
 *********************************/


var CatbRouter = (function() {

  var getHash = function() {

    var _hash = window.location.hash.split('#')[1];

    // default
    if(!_hash || _hash === 'undefined') {
      _hash = catbSettings.currentVid;
    }

    return _hash;
  };

  var setHash = function(val) {
    console.log('setting hash :: ', val);

    // don't set if same as current
    if(catbSettings.previousVid === catbSettings.currentVid) {
      return;
    } else {
      window.location.hash = '#' + val;
    }

  };

  window.addEventListener('hashchange', function(e) {
    catbSettings.currentVid = getHash();

    if(e.oldURL !== e.newURL) {
      YouTubeData.doMainQuery('id');
    }

  }, false);

  return {
    setHash: setHash,
    getHash: getHash
  };
})();
