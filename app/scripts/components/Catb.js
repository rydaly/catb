/*********************************
 *
 * Catb module
 *
 *********************************/

var Catb = (function() {

  var domEls = {};

  var init = function() {

    // init global dom els off the bat
    var _initDom = (function() {
      domEls.commentsOverlay = $('.comments-overlay');
      domEls.videoOverlay = $('.video-overlay');
      // domEls.commentDiv = $('.comment');
    })();

    var _categoryMenu = $('.category-select'),
      _menuBtn = $('.menu-toggle-btn'),
      _mainMenu = $('.menu'),
      _menuVideoSearchForm = $('.menu-video-search-form'),
      _menuChannelSearchForm = $('.menu-channel-search-form'),
      _menuIdForm = $('.menu-id-form'),
      _menuIdInput = $('#menu-id-input'),
      _shareBtn = $('.share-btn');

    var _getMenuItem = function(itemData) {
      var item = $('<li>')
        .append(
          $('<a>', {
            class: 'menu-category-link',
            html: itemData.title
          }).click(function() {
            catbSettings.queryOptions.categoryId = itemData.id;
            YouTubeData.doMainQuery('category'); // TODO
            _toggleMenu();
          }));
      return item;
    };

    var _toggleMenu = function() {
      _mainMenu.toggle();
      _menuBtn.toggleClass('menu-open');
    };

    $.each(catbSettings.categories, function() {
      _categoryMenu.append(_getMenuItem(this));
    });

    _menuBtn.click(function() {
      _toggleMenu();
    });

    _shareBtn.click(function() {
      var copyForm = '<form class="modal-copy-form"><input onClick="this.select();" type="text" name="copy_url" value="' + window.location.href + '" size="' + window.location.href.length + '" readonly></form>';
      Modals.toggleModal('Here ya go, a link to the current video! Share it.' + copyForm, 'Copy This!');
    });

    _menuVideoSearchForm.submit(function(e) {
      e.preventDefault();
      _toggleMenu();

      YouTubeData.doMainQuery('search');
      return false;
    });

    _menuChannelSearchForm.submit(function(e) {
      e.preventDefault();
      _toggleMenu();

      YouTubeData.doMainQuery('channel');
      return false;
    });

    _menuIdForm.submit(function(e) {
      var id = _menuIdInput.val();

      e.preventDefault();
      _toggleMenu();

      catbSettings.setCurrent(id);
      Playlist.setCurrent([]); // clear playlist
      YouTubeData.doMainQuery('id');

      return false;
    });

  };

  return {
    init: init,
    domEls: domEls
  };

})();
