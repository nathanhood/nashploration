
(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('#add-group-member').on('click', 'button', showMemberForm);
    $('#close-member-button').click(hideMemberForm);
    // $('#add-member-button').click(addMember);
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
