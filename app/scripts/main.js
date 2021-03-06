// some yt ids :: HimvFbossU8 6lIqNjC1RKU EFo84MVbVQ8

// TODO :: media queries | small screen comment box, avatar on top
//      :: add a stop button that will kill readback and video
//      :: hide loader on modal dismiss... when error

var catbSettings = {
  queryOptions: {
    categoryId: 0,
    regionCode: 'US',
    maxResults: 10
  },
  defaultVoice: null,
  categories: [],
  previousVid: '',
  currentVid: '74mx2OWM6mE',
  currentComments: [],
  isMobile: true,
  hasSpeechSynth: false,

  setCurrent: function(vidId) {
    this.previousVid = this.currentVid;
    this.currentVid = vidId;
  }
};

$(document).ready(function() {

  catbSettings.isMobile = jQuery.browser.mobile;
  catbSettings.hasSpeechSynth = 'speechSynthesis' in window;

  if(catbSettings.isMobile) Modals.toggleModal('Howdy! This app uses technology that has very limited support on mobile devices. Please check back on your desktop / laptop!');

  // initialize YouTube iframe player API
  YouTubePlayer.initAPI();

  window.onYouTubeIframeAPIReady = function() {
    // initialize YouTube player and load up the data api
    YouTubePlayer.initPlayer().then(function(result) {
      gapi.load('client', runApp);
    }, function(error) {
      Modals.toggleModal('There was an error while initilizing the YouTube player!');
    });
  }

  var runApp = function() {
    // initialize YouTubeData API and SpeechSynthesis API
    var ytData = YouTubeData.init();
    var speech = SpeechSynth.init();

    // When they're both ready...
    $.when(ytData, speech).done(function(r1, r2) {

      // initialize main app
      Catb.init();

      // set current vid to hash
      catbSettings.currentVid = CatbRouter.getHash();

      // perform main query to YouTubeData API
      YouTubeData.doMainQuery('id');

      // wait for comments data
      window.addEventListener('commentsReady', onCommentsReady, false);
    });
  };

  var onCommentsReady = function(e) {
    // console.log(catbSettings.previousVid, catbSettings.currentVid);
    // we're good to go, let's do this thing!
    SpeechSynth.cancelReadback();
    CatbRouter.setHash(catbSettings.currentVid);
    YouTubePlayer.loadVideo(catbSettings.currentVid);

    // wait for video to play
    window.addEventListener('videoStarted', onVideoStarted, false);
  };

  var onVideoStarted = function(e) {
    SpeechSynth.startReadback();
  };

});
