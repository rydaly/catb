/*********************************
 *
 * YouTube Data Module
 *
 *********************************/


var YouTubeData = (function() {

  var vidTitleDiv = $('.vid-title');

  var init = function() {
    // console.log('init youtube DATA', window.gapi.client);
    var d = $.Deferred();

    // init library and get video categories from api
    gapi.client.init({
      'apiKey': 'AIzaSyClXp7mtJlsoJZASUbnugAykmUD8ww_v0c'
    }).then(function() {
      // get categories
      var vidCats = gapi.client.request({
        'path': 'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US'
      }).then(function(response) {
        var catsData = response.result.items;
        var counter = 0;

        for (var i = 0; i < catsData.length; i++) {

          // use only 'assignable' categories. Unassignable categories don't work with popular chart
          if (catsData[i].snippet.assignable) {

            catbSettings.categories[counter] = {
              id: catsData[i].id,
              title: catsData[i].snippet.title
            };

            counter++;
          }

        }

        d.resolve('Categories Ready');
      });

    }, function(error) {
      console.log('error :: ' + error.result.error.message);
      d.reject('Categories Error');
    });

    return d.promise();
  }

  var doMainQuery = function(queryType) { // TODO :: change name of this method

    console.log('MAIN QUERY, current vid :: ', catbSettings.currentVid);
    var modalObj;
    var commentsReadyEvent = new CustomEvent('commentsReady', {
      'detail': catbSettings.currentVid
    });

    SpeechSynth.cancelReadback(); // TODO

    console.log('in switch :: ', queryType);
    switch (queryType) {
      case 'search':
        _doSearchQuery().then(function(results) {
          postQuerySetup(results);
        });
        modalObj = {
          header: 'Wha-Oh!',
          words: 'Looks like that query returned an empty set. Try something else!'
        };
        break;
      case 'id':
        _doIdQuery().then(function(results) {
          postQuerySetup(results);
        });
        modalObj = {
          header: 'Wha-Oh!',
          words: 'Looks like that YouTube ID didn\'t match anything. Check the ID and try again!'
        };
        break;
      case 'category':
        _doCatQuery().then(function(results) {
          postQuerySetup(results);
        });
        modalObj = {
          header: 'Wha-Oh!',
          words: 'Looks like that query returned an empty set. Try something else!'
        };
        break;
      case 'channel':
        _doChannelSearchQuery().then(function(results) {
          var topHitChannelId = results.result.items[0].id.channelId;
          _doChannelQuery(topHitChannelId).then(function(results) {
            postQuerySetup(results);
          });
        });
        modalObj = {
          header: 'Wha-Oh!',
          words: 'Looks like that query returned an empty set. Try something else!'
        };
        break;
    }

    function postQuerySetup(response) {
      // console.log('doMainQuery response for ' + queryType + ' query :: ', response);

      if (response.result.items.length === 0) {
        Catb.toggleModal(modalObj);
        SpeechSynth.cancelReadback();
        // YouTubePlayer.stopVideo();
        return;
      } else {

        // shared properties for query types
        catbSettings.currentTitle = response.result.items[0].snippet.title;
        catbSettings.currentThumb = response.result.items[0].snippet.thumbnails.high.url;
        vidTitleDiv.text(catbSettings.currentTitle);

        // handle individual properties for query types
        switch (queryType) {
          case 'search':
          case 'channel':
            catbSettings.currentVid = response.result.items[0].id.videoId;
            catbSettings.queryOptions.categoryId = null;
            break;
          case 'id':
          case 'category':
            catbSettings.currentVid = response.result.items[0].id;
            break;
        }

      }

      _fetchComments().then(function(result) {
        window.dispatchEvent(commentsReadyEvent);
      });
    }
  }

  var _doSearchQuery = function(searchTerm = '') {
    var term = (searchTerm !== '') ? searchTerm : document.getElementById('menu-video-search').value;
    // console.log('search term :: ', term);
    return gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/search?part=snippet' +
        '&q=' + term +
        '&order=relevance' +
        '&regionCode=' + catbSettings.queryOptions.regionCode +
        '&relevanceLanguage=en' +
        '&maxResults=' + catbSettings.queryOptions.maxResults +
        '&type=video'
    });
  };

  var _doIdQuery = function() {
    // console.log('doing id query :: ', app.currentVid);
    return gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/videos?part=snippet' +
        '&regionCode=' + catbSettings.queryOptions.regionCode +
        '&id=' + catbSettings.currentVid
    });
  };

  var _doCatQuery = function() {
    return gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/videos?part=snippet' +
        '&regionCode=' + catbSettings.queryOptions.regionCode +
        '&videoCategoryId=' + catbSettings.queryOptions.categoryId +
        '&maxResults=' + catbSettings.queryOptions.maxResults +
        '&chart=mostPopular'
    });
  };

  var _doChannelSearchQuery = function(searchTerm = '') {
    // var term = 'breitbart'; // TODO
    var term = (searchTerm !== '') ? searchTerm : document.getElementById('menu-channel-search').value;
    return gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/search?part=snippet' +
        '&q=' + term +
        '&order=relevance' +
        '&regionCode=' + catbSettings.queryOptions.regionCode +
        '&relevanceLanguage=en' +
        '&maxResults=' + catbSettings.queryOptions.maxResults +
        '&type=channel'
    })
  };

  var _doChannelQuery = function(topHitChannelId) {
    return gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/search?part=snippet' +
        '&channelId=' + topHitChannelId +
        '&order=date' +
        '&relevanceLanguage=en' +
        '&regionCode=' + catbSettings.queryOptions.regionCode +
        '&maxResults=' + catbSettings.queryOptions.maxResults +
        '&type=video'
    });
  };

  var _fetchComments = function(videoId) {
    // get comments for vid
    return gapi.client.request({
      'path': 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&order=relevance&textFormat=plainText&videoId=' + catbSettings.currentVid
    }).then(function(response) {

      var commentData = response.result.items;

      // console.log('COMMENTS :: ', response.result.items);

      // empty current comments
      catbSettings.currentComments = [];

      // populate current comments
      for (var i = 0; i < commentData.length; i++) {
        var topLevelAuthor = commentData[i].snippet.topLevelComment.snippet.authorDisplayName;

        catbSettings.currentComments.push({
          text: commentData[i].snippet.topLevelComment.snippet.textDisplay,
          isReply: false,
          inReplyTo: null,
          username: topLevelAuthor,
          canRate: commentData[i].snippet.topLevelComment.snippet.canRate,
          likeCount: commentData[i].snippet.topLevelComment.snippet.likeCount,
          avatar: commentData[i].snippet.topLevelComment.snippet.authorProfileImageUrl
        });
        if (commentData[i].replies !== undefined && commentData[i].replies.comments.length > 0) {
          for (var j = 0; j < commentData[i].replies.comments.length; j++) {
            console.log(commentData[i]);
            catbSettings.currentComments.push({
              text: commentData[i].replies.comments[j].snippet.textDisplay,
              isReply: true,
              inReplyTo: topLevelAuthor,
              canRate: commentData[i].replies.comments[j].snippet.canRate,
              likeCount: commentData[i].replies.comments[j].snippet.likeCount,
              username: commentData[i].replies.comments[j].snippet.authorDisplayName,
              avatar: commentData[i].replies.comments[j].snippet.authorProfileImageUrl
            });
          }
        } else {
          // console.log('NO REPLIES');
        }
      }
    });
  };

  return {
    init: init,
    doMainQuery: doMainQuery
  };

})();
