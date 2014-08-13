
(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('#add-group-member').on('click', 'button', showMemberForm);
    $('#close-member-button').click(hideMemberForm);
    $('#add-member-button').click(addMember);
  }

  var names = [];
  var emails = [];

  function addMember(){
    var name = $('#add-member-form').children('input[name="name"]');
    var email = $('#add-member-form').children('input[name="email"]');
    names.push(name.val().trim());
    emails.push(email.val().trim().toLowerCase());
    $('#new-group-form').children('input[name="names"]').val(names);
    $('#new-group-form').children('input[name="emails"]').val(emails);
    name.val('');
    email.val('');
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
