(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    showStreetView();
    $('body').click(function(event) {
      var target = event.target;
      var sectionNum = $(target).attr('data') * 1;
      findSection(sectionNum);
    });
  }
  function showStreetView() {
    var lat = $('#coords').attr('data-lat');
    var long = $('#coords').attr('data-long');
    var streetLatLng = new google.maps.LatLng(lat, long);
    var panoOptions = {
      position: streetLatLng,
      addressControlOptions: {position: google.maps.ControlPosition.BOTTOM_CENTER},
      linksControl: false,
      panControl: false,
      zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL},
      enableCloseButton: false
    };
    var streetView = new google.maps.StreetViewPanorama(document.getElementById('street-view'), panoOptions);
    wikiTest();
  }
  function wikiTest() {
    $.getJSON("http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&prop=text|images|sections&callback=?").done(function(data) {
      wikipediaHTMLResult(data);
    });
  }
  function wikipediaHTMLResult(data) {
    var readData = $('<div>' + data.parse.text[$traceurRuntime.toProperty('*')] + '</div>');
    var sections = data.parse.sections;
    sections.forEach((function(s, i) {
      var $a = $('<a href="#' + s.anchor + '", data=' + s.index + '>' + s.line + '</a>');
      $('#wiki-nav').append($a);
    }));
    var info = readData.find('p').toArray();
    var $div = $('<div></div>');
    $div.text(info[0].textContent);
    $('#wiki').append($div);
  }
  function findSection(section) {
    $.getJSON(("http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&prop=text&section=" + section + "&callback=?")).done(function(data) {
      var text = data.parse.text[$traceurRuntime.toProperty('*')];
      var readData = $('<div>' + text + '</div>');
      $('#wiki-description').empty();
      $('#wiki-description').append(readData);
      $('html, body').animate({scrollTop: $('#wiki-description').offset().top}, 500);
    });
  }
})();
