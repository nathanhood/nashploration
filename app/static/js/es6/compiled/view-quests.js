(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    $('a#created-quests').addClass('active-button');
    $('.created-quests-wrapper').show();
    $('.joined-quests-wrapper').hide();
    $('.completed-quests-wrapper').hide();
    $('#created-quests').click(showCreatedQuests);
    $('#joined-quests').click(showJoinedQuests);
  }
  function showCreatedQuests(event) {
    event.preventDefault();
    $('.active-button').removeClass('active-button');
    $('a#created-quests').addClass('active-button');
    $('.joined-quests-wrapper, .completed-quests-wrapper').fadeOut(function() {
      $('.created-quests-wrapper').fadeIn();
    });
  }
  function showJoinedQuests(event) {
    event.preventDefault();
    $('.active-button').removeClass('active-button');
    $('a#joined-quests').addClass('active-button');
    $('.created-quests-wrapper, .completed-quests-wrapper').fadeOut(function() {
      $('.joined-quests-wrapper').fadeIn();
    });
  }
})();
