/*********************************
 *
 * SpeechSynthesis Module
 *
 *********************************/


var SpeechSynth = (function() {

  var _voiceExclusions = ['Albert', 'Bad News', 'Bahh', 'Bells', 'Boing',
    'Bubbles', 'Cellos', 'Deranged', 'Good News',
    'Hysterical', 'Pipe Organ', 'Trinoids', 'Whisper',
    'Zarvox'
  ];

  var commentDiv = $('.comment'),
    commentTextDiv = $('.comment-content'),
    commentDetailsDiv = $('.comment-details'),
    commentUserDiv = $('.comment-username'),
    commentAvatarDiv = $('.comment-avatar'),
    commentReplyDiv = $('.comment-is-reply'),
    commentReplyToDiv = $('.comment-in-reply-to'),
    commentLikesDiv = $('.comment-likes'),
    readNextTimeout = null,
    fadeOutTimeout = null,
    voices = [],
    inc = 0;

  var _filterVoices = function(str) {
    return _voiceExclusions.indexOf(str) > -1 ? false : true;
  };

  var init = function() {

    var d = $.Deferred();

    if (catbSettings.hasSpeechSynth) {

      // make sure speechSynthesis has initialized in browser before populating
      window.speechSynthesis.onvoiceschanged = function() {
        var allVoices = window.speechSynthesis.getVoices();

        for (var i = 0; i < allVoices.length; i++) {
          if (allVoices[i].default) catbSettings.defaultVoice = allVoices[i];
          if (allVoices[i].lang === 'en-US') {
            if (_filterVoices(allVoices[i].name)) {
              // returns true if included
              voices.push(allVoices[i]);
            }
          }
        }

        d.resolve('SpeechSynth :: Voices Ready');

      };

    } else {

      if (catbSettings.isMobile) {
        Modals.toggleModal('Support for speech sythesis is spotty on mobile devices. Try using a more modern browser or come back on your desktop. Feel free to continue, but you won\'t be getting a complete experience.');
      } else {
        Modals.toggleModal('Looks like your browser doesn\'t support speech synthesis. Time for an upgrade! Feel free to continue, but you\'ll basically just be seeing a video player!');
      }

      d.reject('SpeechSynth :: Voices Not Avaiable');

    }

    return d.promise();
  };

  var startReadback = function() {
    _readNextComment();
  };

  var cancelReadback = function() {
    window.speechSynthesis.cancel();
    clearTimeout(readNextTimeout);
    clearTimeout(fadeOutTimeout);
    readNextTimeout = null;
    fadeOutTimeout = null;
    inc = 0;
  };

  var _readNextComment = function() {

    if (inc < catbSettings.currentComments.length) {

      window.utterances = [];

      var text = catbSettings.currentComments[inc].text,
        avatar = catbSettings.currentComments[inc].avatar,
        username = catbSettings.currentComments[inc].username,
        isReply = catbSettings.currentComments[inc].isReply,
        inReplyTo = catbSettings.currentComments[inc].inReplyTo,
        likeCount = catbSettings.currentComments[inc].likeCount,
        likeText = likeCount === 1 ? ' like' : ' likes',
        fadeOutDelay = 2000,
        msg = new SpeechSynthesisUtterance(text);

      utterances.push(msg); // saving to array prevents onend event from not firing sometimes

      // set comment display items
      commentTextDiv.html(text);
      commentUserDiv.html(username);
      commentLikesDiv.html(likeCount + likeText);
      commentAvatarDiv.attr('src', avatar);

      if(isReply) {
        commentDetailsDiv.addClass('is-reply');
        commentReplyToDiv.html('<span>in reply to: </span>' + inReplyTo);
        commentReplyDiv.show();
        commentReplyToDiv.show();
      } else {
        commentDetailsDiv.removeClass('is-reply');
        commentReplyToDiv.html('');
        commentReplyDiv.hide();
        commentReplyToDiv.hide();
      }

      commentDiv.removeClass('hide').addClass('show');

      // long msgs fail in non-default voices, so set to default if over 200
      msg.voice = msg.text.length > 200 ? catbSettings.defaultVoice : voices[Math.floor(Math.random() * voices.length)];
      msg.volume = 2;
      msg.rate = CatbUtil.randomRange(1, 1.2);
      msg.pitch = CatbUtil.randomRange(1, 1.5);

      speechSynthesis.speak(msg);

      // msg.onstart = function(e) {
        // console.log('READBACK STARTED');
      // };

      msg.onend = function(e) {
        // console.log('Finished :: ', inc + ' of ' + catbSettings.currentComments.length);
        fadeOutTimeout = setTimeout(function() {
          commentDiv.addClass('hide').removeClass('show');
        }, fadeOutDelay);

        readNextTimeout = setTimeout(function() {
          _readNextComment();
        }, fadeOutDelay + 1500);

        inc++;
      };

      msg.onerror = function(e) {
        console.log('Error in speech, going to next :: ', inc);
        inc++;
        _readNextComment();
      }

    } else {
      // console.log(' :: DONE READING COMMENTS :: ');
      commentDiv.addClass('hide').removeClass('show');
      Playlist.nextVid();
      // TODO :: if no next vid, loop readback
    }
  };

  return {
    init: init,
    startReadback: startReadback,
    cancelReadback: cancelReadback
  };

})();
