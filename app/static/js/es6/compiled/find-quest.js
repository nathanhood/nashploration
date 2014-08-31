(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    initiateFilter();
  }
  function initiateFilter() {
    var quests = $('.available-quests-list').find('.quest-listing-wrapper');
    $('.quest-search').keyup(function(event) {
      if ($(this).val() === '') {
        quests.removeClass('visible').show().addClass('visible');
      } else {
        filter(quests, $(this).val());
      }
    });
  }
  function filter(selector, query) {
    query = $.trim(query).replace(/ /gi, '|');
    $(selector).each(function() {
      ($(this).text().search(new RegExp(query, 'i')) < 0) ? $(this).hide().removeClass('visible') : $(this).show().addClass('visible');
    });
  }
})();
