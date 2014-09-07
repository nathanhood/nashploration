(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    fetchLocationInfo();
  }
  function fetchLocationInfo() {
    var name = $('#coords').data('name');
    $.ajax('/fetchWikiInfo/' + name).done(function(info) {
      if (info.wikiParams) {
        wikiAPICall(info.wikiParams);
      }
      var $div = $('<div></div>');
      var $menuLink = $('<a>Other Learning Resouces</a>');
      $('#other-resources-link').append($menuLink);
      info.otherResources.forEach((function(i) {
        var $a = $('<a href=' + i + '>' + i + '</a><br>');
        $($div).append($a);
      }));
      $('#other-resources-link').on('click', function(event) {
        $('#wiki-description').empty();
        $('#other-resources-text').append($div);
        console.log('in func');
        event.preventDefault();
      });
    });
  }
  function wikiAPICall(params) {
    $.getJSON(("http://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + params + "&prop=text|images|sections&callback=?")).done(function(data) {
      wikipediaHTMLResult(data, params);
    });
  }
  function wikipediaHTMLResult(data, params) {
    var readData = $('<div>' + data.parse.text[$traceurRuntime.toProperty('*')] + '</div>');
    var sections = data.parse.sections;
    sections.forEach((function(s, i) {
      if (s.anchor !== 'External_links') {
        var $a = $('<a id="wiki-section" href="#' + s.anchor + '", data-section=' + s.index + ' data-params=' + params + '>' + s.line + '</a>');
        $('#wiki-nav').append($a);
      }
    }));
    var info = readData.find('p').toArray();
    var $div = $('<div></div>');
    $div.text(info[0].textContent);
    $('#wiki').append($div);
    $('body').on('click', 'a#wiki-section', findSection);
  }
  function findSection() {
    var params = $(this).data('params');
    var section = $(this).data('section') * 1;
    $.getJSON(("http://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + params + "&prop=text&section=" + section + "&callback=?")).done(function(data) {
      var text = data.parse.text[$traceurRuntime.toProperty('*')];
      var readData = $('<div>' + text + '</div>');
      $('#other-resources-text').empty();
      $('#wiki-description').empty();
      $('#wiki-description').append(readData);
      $('html, body').animate({scrollTop: $('#wiki-description').offset().top}, 500);
    });
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
