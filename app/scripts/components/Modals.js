/*********************************
 *
 * Modals Module
 *
 *********************************/

var Modals = (function() {

  var _modalDiv = $('.modal'),
    _modalHeader = $('.modal-header'),
    _modalContent = $('.modal-words'),
    _modalDismissBtn = $('.close'),
    _modalDefaultHeaderText = 'Wha-Oh!';

  _modalDismissBtn.click(function() {
    toggleModal();
  });

  var toggleModal = function(msg, head = '') {

    _modalHeader.html(_modalDefaultHeaderText);
    if(head) _modalHeader.html(head);
    _modalContent.html(msg);

    if (_modalDiv.css('display') === 'none') {
      _modalDiv.css({ 'display': 'flex', 'z-index': 99 });
      Catb.domEls.commentsOverlay.css('z-index', '-1');
    } else {
      _modalDiv.css({ 'display': 'none', 'z-index': -1 });
      Catb.domEls.commentsOverlay.css('z-index', '1');
    }

  };

  return {
    toggleModal: toggleModal
  };

})();
