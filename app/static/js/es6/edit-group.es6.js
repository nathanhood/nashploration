/* jshint unused:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('.add-member-button').click(toggleAddMember);
    $('.send-member-invite').click(sendEmailInvitation);
    $('.remove-group-member').click(removeGroupMember);
    $('.delete-group').click(deleteGroup);
    $('.edit-group-name, .cancel-name').click(toggleGroupName);
    $('.edit-group-description, .cancel-description').click(toggleGroupDescription);

    /* ======== Change Name/Descrition ========== */
    $('.submit-group-name').click(submitNewName);
    $('.submit-group-description').click(submitNewDescription);
  }

/* ========= EDIT GROUP NAME AND DESCRIPTION ========== */

  function submitNewName(){
    var groupId = $('.group-name').data('id');
    var newName = $('.group-name-input').val();
    // ajax('/groups/udate-name', 'POST', {groupId: groupId, groupName: newName}, group=>{
    //
    // }, 'json');
    $.ajax({
      url: '/groups/update-name',
      type: 'POST',
      dataType: 'json',
      data: {groupId: groupId, groupName: newName},
      success: group=>{
        $('.group-name').text(group.name);
        $('.group-name-input').val(group.name);
        $('.cancel-name').trigger('click');
      }
    });
  }

  function submitNewDescription(){
    var groupId = $('.group-name').data('id');
    var newDesc = $('.group-description-input').val();
    $.ajax({
      url: '/groups/update-description',
      type: 'POST',
      dataType: 'json',
      data: {groupId: groupId, groupDesc: newDesc},
      success: group=>{
        $('.group-description').text(group.description);
        $('.group-description-input').val(group.description);
        $('.cancel-description').trigger('click');
      }
    });
  }

  function toggleGroupDescription(){
    if ($(this).hasClass('edit-group-description')) {
      $('.group-description-container').hide();
      $('.group-description-edit-container').show();
    } else if ($(this).hasClass('cancel-description')) {
      $('.group-description-container').show();
      $('.group-description-edit-container').hide();
    }
  }

  function toggleGroupName(){
    if ($(this).hasClass('edit-group-name')) {
      $('.group-name-container').hide();
      $('.group-name-edit-container').show();
    } else if ($(this).hasClass('cancel-name')) {
      $('.group-name-container').show();
      $('.group-name-edit-container').hide();
    }
  }

  /* ============ DELETE GROUP =========== */

  function deleteGroup(){
    var r = confirm('Are you sure you want to delete this group?\nThis cannot be undone.');
    if (r === true) {
      $('#delete-group-form').submit();
    }
  }

  /* ============ REMOVE MEMBER FROM GROUP =========== */

  function removeGroupMember(){
    var memberId = $(this).data('id');
    var groupId = $('.group-name').data('id');

    var r = confirm('Are you sure you want to remove this member?');
    if (r === true) {
      ajax('/groups/remove-member/', 'POST', {memberId:memberId, groupId:groupId},
      (user)=>{
        var confirmation = `<p>${user.userName} was successfully removed!</p>`;
        $('.messages').append(confirmation);
        $(`button[data-id=${memberId}]`).parent('li').remove();
        setTimeout(function(){
          $('.messages p').fadeOut('slow');
        }, 3000);
      }, 'json');
    }
  }

  /* ============ INVITE A NEW MEMBER ============= */

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

          var confirmation = `<p class="email-invite-message">${inviteeName} was successfully invited!</p>`;
          $('.email-invite-messages').append(confirmation);

          setTimeout(function(){
            $('.email-invite-messages p').fadeOut('slow');
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

  function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
    $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
  }

})();
