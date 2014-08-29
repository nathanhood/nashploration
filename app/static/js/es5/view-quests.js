/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('a#created').addClass('active-button');
    $('.created-quests-wrapper').show();
    $('.joined-quests-wrapper').hide();
    $('.completed-quests-wrapper').hide();

    $('#created').click(showQuestList);
    $('#joined').click(showQuestList);
    $('#completed').click(showQuestList);
  }

  function showQuestList(event){
    event.preventDefault();
    // $('a.quest-list-show-link').click(function(e){
    //         e.preventDefault(); // prevent the default action of anchor tag
    //         return false;
    // });
    var name = $(this).attr('id');
    $('.active-button').removeClass('active-button');
    $(this).addClass('active-button');

    $('#active-list').fadeOut(250, function(){
      $('.'+name+'-quests-wrapper').fadeIn(250, function(){
        $('#active-list').removeAttr('id');
        $('.'+name+'-quests-wrapper').attr('id', 'active-list');
      });
    });
  }

  

})();
