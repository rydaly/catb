// some yt ids :: HimvFbossU8 6lIqNjC1RKU EFo84MVbVQ8
// TODO :: check for comments disabled and handle if so
//      :: media queries | small screen comment box, avatar on top
//      :: clean up app initial load. Fade in, etc...

var catbSettings = {
  queryOptions: {
    categoryId: 0,
    regionCode: 'US',
    maxResults: 10
  },
  defaultVoice: null,
  categories: [],
  currentVid: '6lIqNjC1RKU',
  currentTitle: '',
  currentThumb: '',
  currentComments: [],
  isMobile: true,
  hasSpeechSynth: false
};

$(document).ready(function() {

  catbSettings.isMobile = jQuery.browser.mobile;
  catbSettings.hasSpeechSynth = 'speechSynthesis' in window;

  // initialize YouTube iframe player API
  YouTubePlayer.initAPI();

  // when iframe API is ready...
  window.onYouTubeIframeAPIReady = function() {
    // initialize YouTube player and load up the data api
    YouTubePlayer.initPlayer();
    gapi.load('client', runApp);
  }

  var runApp = function() {
    // initialize YouTubeData API and SpeechSynthesis API
    var ytData = YouTubeData.init();
    var speech = SpeechSynth.init();

    // When they're both ready...
    $.when(ytData, speech).done(function(r1, r2) {
      // initialize main app and perform main query to YouTubeData API
      var hash = CatbRouter.getHash();

      Catb.init();

      if(hash) {
        catbSettings.currentVid = hash;
      } else {
        // Do default query
      }
      YouTubeData.doMainQuery('id');
      window.addEventListener('commentsReady', onCommentsReady, false);
    });
  };

  var onCommentsReady = function(e) {
    // console.log("COMMENTS READY :: ", e);
    SpeechSynth.cancelReadback();
    CatbRouter.setHash(catbSettings.currentVid);
    YouTubePlayer.loadVideo(catbSettings.currentVid); // TODO :: wait for video to play to startReadback?
    SpeechSynth.startReadback();
  };

});
