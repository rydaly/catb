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

  var commentDiv = $('.comment');
  var commentTextDiv = $('.comment-content');
  var commentDetailsDiv = $('.comment-details');
  var commentUserDiv = $('.comment-username');
  var commentAvatarDiv = $('.comment-avatar');
  var commentReplyDiv = $('.comment-is-reply');
  var commentReplyToDiv = $('.comment-in-reply-to');
  var commentLikesDiv = $('.comment-likes');
  var readNextTimeout = null;
  var voices = [];
  var inc = 0;

  var _filterVoices = function(str) {
    return _voiceExclusions.indexOf(str) > -1 ? false : true;
  };

  var init = function() {
    // console.log('init speech synth!');
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
        Catb.toggleModal({
          header: 'Wha-Oh!',
          words: 'Support for the speech sythesis is spotty on mobile devices. Try using a more modern browser or come back on your desktop. Feel free to continue, but you won\'t be getting a complete experience.'
        });
      } else {
        Catb.toggleModal({
          header: 'Wha-Oh!',
          words: 'Looks like your browser doesn\'t support speech synthesis. Time for an upgrade! Feel free to continue, but you\'ll basically just be seeing a video player!'
        });
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
    readNextTimeout = null;
    inc = 0;
  };

  var _readNextComment = function() {
    // console.log('READ NEXT :: ', inc);

    if (inc < catbSettings.currentComments.length) {

      window.utterances = [];

      var text = catbSettings.currentComments[inc].text,
        avatar = catbSettings.currentComments[inc].avatar,
        username = catbSettings.currentComments[inc].username,
        isReply = catbSettings.currentComments[inc].isReply,
        inReplyTo = catbSettings.currentComments[inc].inReplyTo,
        likeCount = catbSettings.currentComments[inc].likeCount,
        likeText = likeCount === 1 ? ' like' : ' likes',
        // readNextDelay = catbSettings.currentComments[inc].text.length < 50 ? 2000 : 0,
        readNextDelay = 1000, // maybe omit short comments instead of working out this delay?
        msg = new SpeechSynthesisUtterance(text);

      utterances.push(msg); // saving to array prevents onend event from not firing sometimes

      // set comment display items
      commentTextDiv.html(text);
      commentUserDiv.html(username);
      commentLikesDiv.html(likeCount + likeText);
      commentAvatarDiv.attr('src', avatar);

      if(isReply) {
        // console.log('THIS IS A REPLY, SHOW REPLY INDICATOR');
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

      commentDiv.fadeIn('fast');

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
        // console.log('comment length :: ', catbSettings.currentComments[inc].text.length);

        commentDiv.delay(readNextDelay).fadeOut('fast');

        inc++;

        // TODO :: handle comment filtering in fetchComments .. get all setup before readback
        // TODO :: better filtering... lots of comment slip through
        // while (!_commentFilter(catbSettings.currentComments[inc].text) && inc < catbSettings.currentComments.length) {
        //   console.log('SKIPPING :: ', inc);
        //   inc++
        // };

        readNextTimeout = setTimeout(function() {
          _readNextComment();
        }, readNextDelay + 1500);
      };

      msg.onerror = function(e) {
        console.log('Error in speech, going to next :: ', inc);
        inc++;
        _readNextComment();
      }

    } else {
      // done reading comments
      console.log('DONE READING COMMENTS');
      // TODO :: advance to another video here?
    }
  };

  var _commentFilter = function(input) {
      if (input === undefined) return false;
      if (input.length > 300) return false; // Chrome bug doesn't like long messages

      var firstWord = input.split(' ')[0];
      var english = /^[A-Za-z0-9]*$/;
      var urlCheck = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');

      if (firstWord.match(english)) {
        // return false if has link
        return urlCheck.test(input) ? false : true;
      } else {
        return false;
      }
  };

  return {
    init: init,
    startReadback: startReadback,
    cancelReadback: cancelReadback
  };

})();
