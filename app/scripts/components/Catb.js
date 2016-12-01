/*********************************
 *
 * Catb module
 *
 *********************************/


var Catb = (function() {

  var els = {
    modalDiv: $('.modal'),
    modalHeader: $('.modal-header'),
    modalContent: $('.modal-words'),
    commentsOverlay: $('.comments-overlay')
  };

  var init = function() {
    // console.log('INIT CATB');
    catbSettings.els = els; // TODO :: this needed? don't really know yet
    _handleDomTasks(); // TODO :: don't need this call if it's the only method, just move contents here
  };

  var _handleDomTasks = function() {
    // console.log('HANDLE DOM');

    var categoryMenu = $('.category-select');
    var menuBtn = $('.menu-toggle-btn');
    var mainMenu = $('.menu');
    var menuVideoSearchForm = $('.menu-video-search-form');
    var menuChannelSearchForm = $('.menu-channel-search-form');
    var menuIdForm = $('.menu-id-form');
    var modalDismissBtn = $('.close'); // TODO :: move these to els object above?

    var getMenuItem = function(itemData) {
      var item = $('<li>')
        .append(
          $('<a>', {
            class: 'menu-category-link',
            html: itemData.title
          }).click(function() {
            catbSettings.queryOptions.categoryId = itemData.id;
            YouTubeData.doMainQuery('category'); // TODO
            toggleMenu();
          }));
      return item;
    };

    $.each(catbSettings.categories, function() {
      categoryMenu.append(getMenuItem(this));
    });

    menuBtn.click(function() {
      toggleMenu();
    });

    modalDismissBtn.click(function() {
      toggleModal();
    });

    menuVideoSearchForm.submit(function(e) {
      e.preventDefault();
      toggleMenu();
      YouTubeData.doMainQuery('search');
      return false;
    });

    menuChannelSearchForm.submit(function(e) {
      e.preventDefault();
      toggleMenu();
      YouTubeData.doMainQuery('channel');
      return false;
    });

    menuIdForm.submit(function(e) {
      var id = document.getElementById('menu-id-input').value; // TODO :: move this selector
      Playlist.setCurrent([]); // clear playlist
      catbSettings.currentVid = id;
      e.preventDefault();
      toggleMenu();
      YouTubeData.doMainQuery('id');
      return false;
    });

    function toggleMenu() {
      mainMenu.toggle();
      menuBtn.toggleClass('menu-open');
    }
  };

  var toggleModal = function(obj = null) {
    console.log('modal content :: ', obj);

    if (obj !== null) {
      catbSettings.els.modalHeader.text(obj.header);
      catbSettings.els.modalContent.text(obj.words);
    }

    // console.log(modalDiv.css('display'));
    if (catbSettings.els.modalDiv.css('display') === 'none') {
      catbSettings.els.modalDiv.css({
        'display': 'flex',
        'z-index': 9
      });
      catbSettings.els.commentsOverlay.css('z-index', '-1');
    } else {
      catbSettings.els.modalDiv.css({
        'display': 'none',
        'z-index': -1
      });
      catbSettings.els.commentsOverlay.css('z-index', '1');
    }
  };

  return {
    init: init,
    toggleModal: toggleModal
  };

})();
