(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    $('#submit-password-reset').click(authenticateEmail);
  }
  function authenticateEmail() {
    var email = $('input[name="email"]').val();
    if (email.length > 0) {
      ajax('/authenticate-email', 'POST', {email: email}, (function(user) {
        if (user.email === email) {
          $('input[name="userName"]').val(user.userName);
          $('input[name="userId"]').val(user._id);
          $('form#send-password-reset').submit();
        } else {
          alert('There is no account with that email');
        }
      }), 'json');
    } else {
      alert('Email field cannot be blank');
    }
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
