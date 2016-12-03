/*********************************
 *
 * Router Module
 *
 *********************************/


var CatbRouter = (function() {

  var getHash = function() {

    var _hash = history ? history.state : window.location.hash.split('#')[1];

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
      console.log('SAME SAME');
      return;
    } else {
      if(history.pushState) {
        history.pushState(val, '', '#' + val);
      } else {
        window.location.hash = '#' + val;
      }
    }

  };

  window.onpopstate = function(e) {
    console.log('ON POP STATE :: ', e);
    console.log('history :: ', history);
    // console.log('');
    catbSettings.currentVid = e.state;
    YouTubeData.doMainQuery('id');
  };

  return {
    setHash: setHash,
    getHash: getHash
  };
})();
