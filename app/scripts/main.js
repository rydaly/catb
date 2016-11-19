// yt api key :: AIzaSyClXp7mtJlsoJZASUbnugAykmUD8ww_v0c
// yt ids for testing :: HimvFbossU8 6lIqNjC1RKU

// TODO :: check for comments disabled and move to next if so
//      :: option to skip to next comment
//      :: if comment has a link, skip it
//      :: media queries
//      :: re-write this code, it's garbage! And this is what happens when you don't plan and add features as you go, kids. 


var app = {
  queryOptions: {
    categoryId: 0,
    regionCode: 'US',
    maxResults: 10
  },
  categories: [],
  voices: [],
  currentVid: 'HimvFbossU8',
  currentTitle: '',
  currentThumb: '',
  currentComments: [],
  utterances: [],
  modalObj: {},
  inc: 0,
  isMobile: true,
  hasSpeechSynth: false
};

var readNextTimeout = null;

$(document).ready(function() {
  app.isMobile = jQuery.browser.mobile;
  app.hasSpeechSynth = 'speechSynthesis' in window;
  // app.isMobile = false;
  // app.hasSpeechSynth = false;

  if (app.hasSpeechSynth) {
    window.speechSynthesis.onvoiceschanged = function() {
      // filter for english voices
      var allVoices = window.speechSynthesis.getVoices();
      for (var i = 0; i < allVoices.length; i++) {
        if (allVoices[i].lang === 'en-US') {
          if (filterVoices(allVoices[i].name)) {
            // returns true if included
            app.voices.push(allVoices[i]);
          }
        }
      }
    };
  } else {
    if (app.isMobile) {
      app.modalObj = {
        header: 'Wha-Oh!',
        words: 'Support for the speech sythesis is spotty on mobile devices. Try using a more modern browser or come back on your desktop. Feel free to continue, but you won\'t be getting a complete experience.'
      };
    } else {
      app.modalObj = {
        header: 'Wha-Oh!',
        words: 'Looks like your browser doesn\'t support speech synthesis. Time for an upgrade! Feel free to continue, but you\'ll basically just be seeing a video player!'
      };
    }

    toggleModal(app.modalObj);
  }

  // load up the iframe api
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // query api
  gapi.load('client', initYouTubeApi);
});

function getVideoById(ytid) {
  app.currentVid = ytid;
  doMainQuery('id');
}

function doMainQuery(queryType) {
  var req;

  console.log(app.currentComments);
  resetReadback();
  console.log(app.currentComments);

  switch (queryType) {
    case 'search':
      doSearchQuery();
      break;
    case 'id':
      doIdQuery();
      break;
    case 'category':
      doCatQuery();
      break;
    default:

  }

  function doSearchQuery() {
    var term = document.getElementById('menu-manual-input').value;

    req = gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/search?part=snippet' +
        '&q=' + term +
        '&order=relevance' +
        '&regionCode=' + app.queryOptions.regionCode +
        '&relevanceLanguage=en' +
        '&maxResults=' + app.queryOptions.maxResults +
        '&type=video'
    }).then(function(response) {
      // console.log('search result :: ', response.result.items[0].id.videoId);
      app.currentVid = response.result.items[0].id.videoId;
      app.queryOptions.categoryId = null;

      app.currentTitle = response.result.items[0].snippet.title;
      app.currentThumb = response.result.items[0].snippet.thumbnails.high.url;

      setVideoDetails();

      // get comments for vid
      return gapi.client.request({
        'path': 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&order=relevance&textFormat=plainText&videoId=' + app.currentVid
      })
    });
  }

  function doIdQuery() {
    // console.log('doing id query :: ', app.currentVid);

    req = gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/videos?part=snippet' +
        '&regionCode=' + app.queryOptions.regionCode +
        '&id=' + app.currentVid
    }).then(function(response) {
      if (response.result.items[0] === undefined) {
        app.modalObj = {
          header: 'Wha-Oh!',
          words: 'Looks like that YouTube ID didn\'t match anything. Check the ID and try again!'
        };
        toggleModal(app.modalObj);
      } else {
        app.currentTitle = response.result.items[0].snippet.title;
        app.currentThumb = response.result.items[0].snippet.thumbnails.high.url;
        setVideoDetails();
      }

      // get comments for vid
      return gapi.client.request({
        'path': 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&order=relevance&textFormat=plainText&videoId=' + app.currentVid
      })
    }, function(error) {
      console.log('ERROR :: ', error);
    })
  }

  function doCatQuery() {
    req = gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/videos?part=snippet' +
        '&regionCode=' + app.queryOptions.regionCode +
        '&videoCategoryId=' + app.queryOptions.categoryId +
        '&maxResults=' + app.queryOptions.maxResults +
        '&chart=mostPopular'
    }).then(function(response) {
      // console.log('current vid  :: ', response.result.items.length);
      if (response.result.items.length === 0) {
        app.modalObj = {
          header: 'Wha-Oh!',
          words: 'Looks like that query returned an empty set. Try something else!'
        };
        toggleModal(app.modalObj);
        resetReadback();
      } else {
        app.currentTitle = response.result.items[0].snippet.title;
        app.currentThumb = response.result.items[0].snippet.thumbnails.high.url;
        app.currentVid = response.result.items[0].id;
        setVideoDetails();
      }

      // get comments for vid
      return gapi.client.request({
        'path': 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&order=relevance&textFormat=plainText&videoId=' + app.currentVid
      })

    }, function(error) {
      console.log('ERROR :: ', error);
    })
  }

  return req.then(function(response) {
    var topComments = response.result.items;

    // empty current comments
    app.currentComments = [];

    // populate current comments
    for (var i = 0; i < topComments.length; i++) {
      // console.log(topComments[i].replies.comments.length);
      app.currentComments.push(topComments[i].snippet.topLevelComment.snippet.textDisplay);
      if (topComments[i].replies !== undefined && topComments[i].replies.comments.length > 0) {
        for (var j = 0; j < topComments[i].replies.comments.length; j++) {
          // console.log(topComments[i].replies.comments[j].snippet.textDisplay);
          app.currentComments.push(topComments[i].replies.comments[j].snippet.textDisplay);
        }
      } else {
        // console.log('NO REPLIES');
      }
    }

    initVideoPlayer(app.currentVid);
    if (app.hasSpeechSynth) {
      initTextToSpeech(app.currentComments)
    };

  })
}

function initYouTubeApi() {
  // init library
  gapi.client.init({
    'apiKey': 'AIzaSyClXp7mtJlsoJZASUbnugAykmUD8ww_v0c'
  }).then(function() {
    // get all categories
    var vidCats = gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US'
    }).then(function(response) {
      var catsData = response.result.items;
      var counter = 0;

      for (var i = 0; i < catsData.length; i++) {
        // use only 'assignable' categories. Unassignable categories don't work with popular chart
        if (catsData[i].snippet.assignable) {
          app.categories[counter] = {
            id: catsData[i].id,
            title: catsData[i].snippet.title
          };
          counter++;
        }
        if (i === catsData.length - 1) handleDomTasks();
      }
    });

    // set default video here
    return doMainQuery('id');

  }, function(error) {
    console.log('error :: ' + error.result.error.message);
  });

};




function onYouTubeIframeAPIReady() {
  // console.log(' :: yt ready :: ');
  // TODO :: make sure we're ready here with a promise
}

function initVideoPlayer(currentVid) {
  if (!app.player) {
    app.player = new YT.Player('player', {
      width: '1280',
      height: '720',
      videoId: currentVid,
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
  } else {
    app.player.loadVideoById(currentVid);
  }
}

function resetReadback() {
  clearTimeout(readNextTimeout);
  readNextTimeout = null;
  if (app.hasSpeechSynth) speechSynthesis.cancel();
  app.inc = 0;
}

function onPlayerReady(event) {
  if (app.isMobile) {
    $('#player').fadeIn('fast');
  } else {
    event.target.playVideo(); // auto play when not mobile
  }
  event.target.setVolume(15);
}

function onPlayerStateChange(event) {
  var playerDiv = $('#player');

  if (event.data === YT.PlayerState.ENDED) {
    event.target.playVideo(); // loop video
  } else if (event.data === YT.PlayerState.PLAYING) {
    commentsOverlay.css('display', 'flex');
    playerDiv.fadeIn('fast');
  }
}

function onPlayerError(event) {
  // console.log(' :: player error :: ');
}






var commentDiv = $('.comment');

function initTextToSpeech(currentComments) {

  function readNextComment() {
    if (app.inc < currentComments.length) {
      // set display text
      commentDiv.html(currentComments[app.inc]);
      commentDiv.fadeIn('fast');

      app.utterances = [];
      var text = currentComments[app.inc],
        msg = new SpeechSynthesisUtterance(text);
      app.utterances.push(msg); // saving to array prevents onend event from not firing sometimes

      msg.rate = randomRange(1, 1.2);
      msg.pitch = randomRange(1, 1.5);
      msg.voice = app.voices[Math.floor(Math.random() * app.voices.length)];
      speechSynthesis.speak(msg);

      msg.onend = function(e) {
        console.log('Finished in ' + e.elapsedTime + ' seconds.');
        commentDiv.fadeOut('fast');

        app.inc++;
        while (!commentFilter(currentComments[app.inc])) app.inc++; // skip over non-english comments (sorry for now world) and comments with links

        readNextTimeout = setTimeout(function() {
          readNextComment();
        }, 1500);
      };

      msg.onerror = function(e) {
        console.log('Error in speech ');
        app.inc++;
        readNextComment();
      }

    } else {
      // done reading comments
      // TODO :: advance to another video here?
    }

  }

  resetReadback();
  readNextComment();

}


function handleDomTasks() {
  var menu = $('.category-select');

  var getMenuItem = function(itemData) {
    var item = $('<li>')
      .append(
        $('<a>', {
          class: 'menu-category-link',
          html: itemData.title
        }).click(function() {
          console.log(itemData.id);
          app.queryOptions.categoryId = itemData.id;
          doMainQuery('category');
        }));
    return item;
  };

  $.each(app.categories, function() {
    menu.append(getMenuItem(this));
  });

  handleDomListeners();
}

function handleDomListeners() {
  var menuBtn = $('.menu-toggle-btn');
  var menu = $('.menu');
  var menuSearchForm = $('.menu-search-form');
  var menuIdForm = $('.menu-id-form');
  var menuCatLinks = $('.menu-category-link');
  var modalDismissBtn = $('.close');

  menuBtn.click(function() {
    toggleMenu();
  });

  menuCatLinks.click(function() {
    toggleMenu();
  });

  modalDismissBtn.click(function() {
    toggleModal();
  });

  menuSearchForm.submit(function(e) {
    e.preventDefault();
    toggleMenu();
    doMainQuery('search');
    return false;
  });

  menuIdForm.submit(function(e) {
    var id = document.getElementById('menu-id-input').value;
    e.preventDefault();
    toggleMenu();
    getVideoById(id);
    return false;
  });

  function toggleMenu() {
    menu.toggle();
    menuBtn.toggleClass('menu-open');
  }
}

var modalDiv = $('.modal');
var modalHeader = $('.modal-header');
var modalContent = $('.modal-words');
var commentsOverlay = $('.comments-overlay');

function toggleModal(content = null) {
  // console.log('modal content :: ', content);
  if (content !== null) {
    modalHeader.text(content.header);
    modalContent.text(content.words);
  }

  console.log(modalDiv.css('display'));
  if (modalDiv.css('display') === 'none') {
    modalDiv.css({
      'display': 'flex',
      'z-index': 9
    });
    commentsOverlay.css('z-index', '-1');
  } else {
    modalDiv.css({
      'display': 'none',
      'z-index': -1
    });
    commentsOverlay.css('z-index', '1');
  }
}

var vidTitle = $('.vid-title');
var vidForeground = $('.video-foreground');

function setVideoDetails() {
  vidTitle.text(app.currentTitle);
}

// UTILITIES
var voiceExclusions = ['Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Deranged', 'Good News', 'Hysterical', 'Pipe Organ', 'Trinoids', 'Whisper', 'Zarvox'];

function filterVoices(str) {
  if (voiceExclusions.indexOf(str) > -1) {
    return false;
  } else {
    return true;
  }
}

var categoryExclusions = ['Travel & Events', 'Education', 'Nonprofits & Activism', 'Anime/Animation', 'Family', 'Autos & Vehicles'];

function filterCategories(str) {
  console.log(categoryExclusions.indexOf(str));
  if (categoryExclusions.indexOf(str) > -1) {
    return false;
  } else {
    return true;
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function commentFilter(input) {
  if (input === undefined) return;

  var firstWord = input.split(' ')[0];
  var english = /^[A-Za-z0-9]*$/;
  var urlCheck = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');

  if (firstWord.match(english)) {
    if (urlCheck.test(input)) {
      console.log('WE HAVE A LINK');
      return false;
    } else {
      console.log('NO LINK HERE');
      return true;
    }
  } else {
    return false;
  }

  // return firstWord.match(english) ? true : false;
}

/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a) {
  (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
})(navigator.userAgent || navigator.vendor || window.opera);
