(function(){
  'use strict';

  $(document).ready(init);

  function init() {
    // $('input.main-search-input').hide();
    $('a.show-searchbar').click(showSearchbar);
    $('ul.group-menu').hide();
    $('a.group-menu-button').click(showGroupMenu);
    $('a.quest-menu-button').click(showQuestMenu);
    $('a.submit-logout').click(submitLogoutForm);
    $('a.back-button').click(goBack);

    $('a#log-in-main, a#already-login').click(showLoginForm);
  }

  function showLoginForm(){
    $('.login-wrapper').slideToggle();
  }

  function goBack(){
    parent.history.back();
    return false;
  }

  // FUNCTIONS FOR TEMPLATE PAGE ======================================================
  function showSearchbar(){
    // $('input.main-search-input').show();
    $('input.main-search-input').toggleClass('show-searchbar-input');
    $('a.show-searchbar').toggleClass('small-magnifying-glass');
  }

  function submitLogoutForm(event){
  	event.preventDefault();
  	$('form.logout-form').submit();
  }

  // FUNCTIONS FOR PROFILE PAGE =======================================================
  function showGroupMenu(event){
  	event.preventDefault();
  	$('a.group-menu-button').addClass('active-button');
  	$('a.quest-menu-button').removeClass('active-button');
		$('ul.quest-menu').fadeOut(250, function(){
			$('ul.group-menu').fadeIn(250);
		});
  }

  function showQuestMenu(event){
  	event.preventDefault();
  	$('a.quest-menu-button').addClass('active-button');
  	$('a.group-menu-button').removeClass('active-button');
		$('ul.group-menu').fadeOut(250, function(){
			$('ul.quest-menu').fadeIn(250);
		});
  }

})();
