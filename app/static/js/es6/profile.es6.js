

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fadeConfirmMessage();
    $('.join-group-link').click(toggleGroupCodeForm);
    $('.join-group-form button').click(submitGroupCode);
  }

  function submitGroupCode(){
    var groupCode = $('.group-code').val();
    if (groupCode.length !== 5) {
      var message = `<p>That is an invalid code. It can only be 5 characters long</p>`;
      $('.messages').append(message);
      $('.messages').show();
      fadeConfirmMessage();
    } else {
      $('.join-group-form form').submit();
    }
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
