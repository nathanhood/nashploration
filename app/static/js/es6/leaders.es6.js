/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('.show-group-rankings').on('click', showGroupRankings);
    $('.show-main-rankings').click(showMainRankings);
  }

  function showGroupRankings(){
    var groupId = $(this).data('id');
    var groupName = $(this).prev('.group-name').text();
    $.ajax({
      url: '/groups/leader-board',
      type: 'POST',
      dataType: 'json',
      data: {groupId: groupId},
      success: function(leaders){
        $('.group-leader-list ol').empty();
        $('.group-heading').remove();
        if (leaders.length > 0) {
          $('.group-leader-list').prepend(`<h2 class="group-heading">${groupName}</h2>`);
          leaders.forEach(function(leader){
            var listing = `<h3 class="leader-name">${leader.userName}</h3>
                           <img class="leader-image" src=${leader.photo.filePath}>
                           <p class="leader-points">Points: ${leader.points}</p>
                           <p class="leader-class">Class: ${leader.class}</p>
                           <img class="badge-image", src=${leader.badges[leader.badges.length -1].filePath}>`;
            $('.group-leader-list ol').append(listing);
          });
        } else {
          $('.group-leader-list ol').append('<li>Cannot find any members from this group</li>');
        }
        if ($('.group-leader-list').css('display') === 'none') {
          $('.main-leader-list').fadeOut(function(){
            $('.group-leader-list').fadeIn();
          });
        }
      }
    });
  }

  function showMainRankings(){
    $('.group-leader-list').fadeOut(function(){
      $('.main-leader-list').fadeIn();
    });
  }

})();
