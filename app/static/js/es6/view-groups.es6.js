/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fadeMessages();
  }

  function fadeMessages(){
    setTimeout(function(){
      $('.messages p').fadeOut('slow');
    }, 4000);
  }


})();
