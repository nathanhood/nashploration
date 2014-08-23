

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fadeConfirmMessage();
    $('.join-group-link').click(toggleGroupCodeForm);
    $('.join-group-form button').click(submitGroupCode);
  }

  function submitGroupCode(){
    
  }

  function toggleGroupCodeForm(){
    $('.join-group-form').slideToggle();
  }

  function fadeConfirmMessage(){
    setTimeout(function(){
      $('.messages').fadeOut('slow');
    }, 4000);
  }

})();
