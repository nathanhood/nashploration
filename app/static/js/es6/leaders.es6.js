/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('.overall-menu-button, .groups-menu-button').click(toggleOverallAndGroup);
    $('.show-group-rankings').on('click', showGroupRankings);
  }

  function toggleOverallAndGroup(event){
    if (!$(this).hasClass('active-button')) {
      $(this).addClass('active-button');
      if ($(this).hasClass('overall-menu-button')) {

        $('.groups-menu-button').removeClass('active-button');
        $('.show-group-list').fadeOut(250, function(){
          $('#overall-leaders-list').fadeIn(250);
        });
      } else if ($(this).hasClass('groups-menu-button')) {

        $('.overall-menu-button').removeClass('active-button');
        $('#overall-leaders-list').fadeOut(250, function(){
          $('.show-group-list').fadeIn(250);
        });
      }
    }
    event.preventDefault();
  }

  function showGroupRankings(){
    var groupId = $(this).data('id');
    var groupName = $(this).parent().prev().children('.group-name').text();
    $.ajax({
      url: '/groups/leader-board',
      type: 'POST',
      dataType: 'json',
      data: {groupId: groupId},
      success: function(leaders){
        $('#group-leaders-list ol').empty();
        if (leaders.length > 0) {
          $('#group-leaders-list ol').append(`<h2 class="group-heading", id=${groupId}>${groupName} Leaders</h2><div class="border"></div>`);
          leaders.forEach(function(leader){
            var listing = '<li class="leader-listing"><div class="leader-image-container", style="background-image: url('+leader.photo.filePath+')"></div><div class="leader-information-container"><p class="label">username:</p><p class="leader-name">'+leader.userName+'</p><p class="label">points:</p><p class="leader-points">'+leader.points+'</p></div><div class="leader-badge-container", style="background-image: url('+leader.badges[leader.badges.length -1].filePath+')"></li></div><div class="border"></div>';
            $('#group-leaders-list ol').append(listing);
          });

          $('html, body').animate({ // scrolls to top of group list if off screen
            scrollTop: $(`#${groupId}`).offset().top
          }, 500);
        } else {
          $('#group-leaders-list ol').append('<li>Cannot find any members from this group</li>');
        }
      }
    });
  }


})();
