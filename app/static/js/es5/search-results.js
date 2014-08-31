/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('a#quests').addClass('active-button');
    $('.quests-results-wrapper').show();
    $('.locations-results-wrapper').hide();
    $('.users-results-wrapper').hide();

    $('#quests').click(showResultsList);
    $('#locations').click(showResultsList);
    $('#users').click(showResultsList);
  }

  function showResultsList(event){
    event.preventDefault();
    var name = $(this).attr('id');
    $('.active-button').removeClass('active-button');
    $(this).addClass('active-button');

    $('#active-list').fadeOut(250, function(){
      $('.'+name+'-results-wrapper').fadeIn(250, function(){
        $('#active-list').removeAttr('id');
        $('.'+name+'-results-wrapper').attr('id', 'active-list');
      });
    });
  }

  

})();
