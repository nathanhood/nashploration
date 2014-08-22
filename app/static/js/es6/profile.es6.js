

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fadeConfirmMessage();
  }

  function fadeConfirmMessage(){
    setTimeout(function(){
      $('.messages').fadeOut('slow');
    }, 4000);
  }

})();
