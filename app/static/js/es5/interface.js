(function(){
  'use strict';

  $(document).ready(init);

  function init() {
    $('a.show-searchbar').click(showSearchbar);
    $('ul.group-menu').hide();
    $('a.group-menu-button').click(showGroupMenu);
    $('a.quest-menu-button').click(showQuestMenu);
    $('a.submit-logout').click(submitLogoutForm);
  }

  // FUNCTIONS FOR TEMPLATE PAGE ======================================================
  function showSearchbar(){
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
		$('ul.quest-menu').fadeOut(function(){
			$('ul.group-menu').fadeIn();
		});
  }

  function showQuestMenu(event){
  	event.preventDefault();
  	$('a.quest-menu-button').addClass('active-button');
  	$('a.group-menu-button').removeClass('active-button');
		$('ul.group-menu').fadeOut(function(){
			$('ul.quest-menu').fadeIn();
		});
  }

})();
