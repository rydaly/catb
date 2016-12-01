/*********************************
 *
 * Router Module
 *
 *********************************/


var CatbRouter = (function() {
  var getHash = function() {
    console.log('GET HASH :: ', window.location.hash.split('#')[1]);
    return window.location.hash.split('#')[1];
  };

  var setHash = function(val) {
    // console.log('SET HASH :: ', val);
    window.location.hash = '#' + val;
    // window.location.search = val;
    // if(history.pushState) {
    //   location.hash = '#' + val;
    //   // history.pushState(null, null, '#' + val);
    // } else {
    //   location.hash = '#' + val;
    // }
  };

  return {
    setHash: setHash,
    getHash: getHash
  };
})();
