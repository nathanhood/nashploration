(function(){
  'use strict';

  $(document).ready(init);

  function init() {
    $('a.show-searchbar').click(showSearchbar);
  }

  function showSearchbar(){
    $('input.main-search-input').toggleClass('show-searchbar-input');
    $('a.show-searchbar').toggleClass('small-magnifying-glass');
  }

})();
