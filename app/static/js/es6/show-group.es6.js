/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('.add-member-button').click(toggleAddMember);
    $('.send-member-invite').click(sendEmailInvitation);
  }

  function toggleAddMember(){
    $('.add-member-info').slideToggle();
  }

  function sendEmailInvitation(){
    var name = $('input[name="name"]').val().trim();
    var email = $('input[name="email"]').val().trim().toLowerCase();
    var groupId = $('.group-name').data('id');
    if (nameIsValid(name) > 0 && emailIsValid(email)) {
      $.ajax({
        url: '/groups/send-invitation',
        type: 'POST',
        dataType: 'text',
        data: {name:name, email:email, groupId:groupId},
        success: inviteeName=>{
          $('input[name="name"]').val('');
          $('input[name="email"]').val('');
          toggleAddMember();

          var confirmation = `<p>${inviteeName} was successfully invited!</p>`;
          $('.messages').append(confirmation);

          setTimeout(function(){
            $('.messages p').fadeOut('slow');
          }, 3000);
        }
      });
    }
  }

  function nameIsValid(name){
    var status = false;
    if (name.length > 0) {
      status = true;
    } else {
      alert('Please enter a name');
    }
    return status;
  }

  function emailIsValid(email){
    var status = false;
    var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (email.search(emailRegEx) === -1) {
      alert('Please enter a valid email address.');
    } else {
      status = true;
    }
    return status;
  }

})();
