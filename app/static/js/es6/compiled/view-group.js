(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    $('.add-member-button').click(toggleAddMember);
    $('.send-member-invite').click(sendEmailInvitation);
    $('.remove-group-member').click(removeGroupMember);
    $('.delete-group').click(deleteGroup);
  }
  function deleteGroup() {
    var r = confirm('Are you sure you want to delete this group?\nThis cannot be undone.');
    if (r === true) {
      $('#delete-group-form').submit();
    }
  }
  function removeGroupMember() {
    var memberId = $(this).data('id');
    var groupId = $('.group-name').data('id');
    var r = confirm('Are you sure you want to remove this member?');
    if (r === true) {
      ajax('/groups/remove-member/', 'POST', {
        memberId: memberId,
        groupId: groupId
      }, (function(user) {
        var confirmation = ("<p>" + user.userName + " was successfully removed!</p>");
        $('.messages').append(confirmation);
        $(("button[data-id=" + memberId + "]")).parent('li').remove();
        setTimeout(function() {
          $('.messages p').fadeOut('slow');
        }, 3000);
      }), 'json');
    }
  }
  function toggleAddMember() {
    $('.add-member-info').slideToggle();
  }
  function sendEmailInvitation() {
    var name = $('input[name="name"]').val().trim();
    var email = $('input[name="email"]').val().trim().toLowerCase();
    var groupId = $('.group-name').data('id');
    if (nameIsValid(name) > 0 && emailIsValid(email)) {
      $.ajax({
        url: '/groups/send-invitation',
        type: 'POST',
        dataType: 'text',
        data: {
          name: name,
          email: email,
          groupId: groupId
        },
        success: (function(inviteeName) {
          $('input[name="name"]').val('');
          $('input[name="email"]').val('');
          toggleAddMember();
          var confirmation = ("<p>" + inviteeName + " was successfully invited!</p>");
          $('.messages').append(confirmation);
          setTimeout(function() {
            $('.messages p').fadeOut('slow');
          }, 3000);
        })
      });
    }
  }
  function nameIsValid(name) {
    var status = false;
    if (name.length > 0) {
      status = true;
    } else {
      alert('Please enter a name');
    }
    return status;
  }
  function emailIsValid(email) {
    var status = false;
    var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (email.search(emailRegEx) === -1) {
      alert('Please enter a valid email address.');
    } else {
      status = true;
    }
    return status;
  }
  function ajax(url, type) {
    var data = arguments[2] !== (void 0) ? arguments[2] : {};
    var success = arguments[3] !== (void 0) ? arguments[3] : (function(r) {
      return console.log(r);
    });
    var dataType = arguments[4] !== (void 0) ? arguments[4] : 'html';
    $.ajax({
      url: url,
      type: type,
      dataType: dataType,
      data: data,
      success: success
    });
  }
})();
