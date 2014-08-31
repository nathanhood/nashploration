
(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('#add-group-member').on('click', 'button', showMemberForm);
    $('#close-member-button').click(hideMemberForm);
    $('#add-member-button').click(addMember);
    $('#build-group').click(submitForm);
  }

  function submitForm(){
    $('.error-messages').empty();

    var names = $('#new-group-form').children('input[name="names"]').val();
    var emails = $('#new-group-form').children('input[name="emails"]').val();
    var title = $('#new-group-form').children('input[name="title"]').val();
    if (!names || !emails) {
      noMembersAlert();
    }
    if (!title) {
      noTitleAlert();
    }
    if (names && emails && title) {
      $('form').submit();
    }
  }

// ================ Error Handling ============
  function noMembersAlert(){
    var message = `<div class="error-message">
                   <p>Please add at least one member to your group</p>
                   </div>`;
    $('.error-messages').append(message);
  }

  function noTitleAlert(){
    var message = `<div class="error-message">
                   <p>Please give your group a name</p>
                   </div>`;
    $('.error-messages').append(message);
  }



  var names = [];
  var emails = [];

  function addMember(){
    var nameForm = $('#add-member-form').children('input[name="name"]');
    var emailForm = $('#add-member-form').children('input[name="email"]');
    var name = nameForm.val().trim();
    var email = emailForm.val().trim().toLowerCase();
    if (nameIsValid(name) > 0 && emailIsValid(email)) {
      names.push(name);
      emails.push(email);
      $('#new-group-form').children('input[name="names"]').val(names);
      $('#new-group-form').children('input[name="emails"]').val(emails);
      nameForm.val('');
      emailForm.val('');
       $('ul.added-members').append(`<li>
                                        <p><span class="label">Name:</span> ${name}</p>
                                        <p><span class="label">Email:</span> ${email}</p>
                                     </li>`);

      $('#total-group-members').text(`Members: ${names.length}`);
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

  function showMemberForm(){
    $('#add-member-form').slideToggle();
    $('#add-group-member').hide();
  }

  function hideMemberForm(){
    $('#add-member-form').slideToggle();
    $('#add-group-member').show();
  }

})();
