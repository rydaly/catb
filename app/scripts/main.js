// some yt ids :: HimvFbossU8 6lIqNjC1RKU EFo84MVbVQ8

// TODO :: media queries | small screen comment box, avatar on top
//      :: clean up app initial load. Fade in, etc...
//      :: add 'view on YouTube' link and link to channels in video details
//      :: prefixes / bourbon
//      :: check for empty or undefined hash and load default if so
//      :: create a Modals module
//      :: loop comment playback when only one video

var catbSettings = {
  queryOptions: {
    categoryId: 0,
    regionCode: 'US',
    maxResults: 10
  },
  defaultVoice: null,
  categories: [],
  currentVid: 'EFo84MVbVQ8',
  currentComments: [],
  isMobile: true,
  hasSpeechSynth: false
};

$(document).ready(function() {

  catbSettings.isMobile = jQuery.browser.mobile;
  catbSettings.hasSpeechSynth = 'speechSynthesis' in window;

  // initialize YouTube iframe player API
  YouTubePlayer.initAPI();

  window.onYouTubeIframeAPIReady = function() {
    // initialize YouTube player and load up the data api
    YouTubePlayer.initPlayer().then(function(result) {
      gapi.load('client', runApp);
    }, function(error) {
      console.log('ERROR on player init :: ', error);
    });
  }

  var runApp = function() {
    // initialize YouTubeData API and SpeechSynthesis API
    var ytData = YouTubeData.init();
    var speech = SpeechSynth.init();

    // When they're both ready...
    $.when(ytData, speech).done(function(r1, r2) {
      var hash = CatbRouter.getHash();

      // initialize main app
      Catb.init();

      // get hash if we have one
      if(hash) {
        catbSettings.currentVid = hash;
      } else {
        // Do default query :: TODO
      }

      // perform main query to YouTubeData API
      YouTubeData.doMainQuery('id');

      // wait for comments data
      window.addEventListener('commentsReady', onCommentsReady, false);
    });
  };

  var onCommentsReady = function(e) {
    // we're good to go, let's do this thing!
    SpeechSynth.cancelReadback();
    CatbRouter.setHash(catbSettings.currentVid);
    YouTubePlayer.loadVideo(catbSettings.currentVid);
    SpeechSynth.startReadback();
  };

});
