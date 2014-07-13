/* global io */

(function(){
  'use strict';

  $(document).ready(initialize);

  var socket;

  function initialize(){
    initializeSocketIo();
  }

  function initializeSocketIo(){
    socket = io.connect('/app');
  }
})();
