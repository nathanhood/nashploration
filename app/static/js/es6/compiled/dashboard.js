(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    fadeConfirmMessage();
  }
  function fadeConfirmMessage() {
    if ($('#quest-confirmation').length > 0) {
      setTimeout(function() {
        $('#quest-confirmation').fadeOut('slow');
      }, 3000);
    }
  }
})();
