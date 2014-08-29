(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    showStreetView();
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
    $.getJSON("http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&prop=text|images&callback=?").done(function(data) {
      wikipediaHTMLResult(data);
    });
  }
  function wikipediaHTMLResult(data) {
    var readData = $('<div>' + data.parse.text[$traceurRuntime.toProperty('*')] + '</div>');
    var box = readData.find('.infobox').toArray();
    var info = readData.find('p').toArray();
    console.log(info);
    info.forEach((function(p) {
      var $div = $('<div></div>');
      $div.text(p.textContent);
      $('#wiki-description').append($div);
    }));
    var imageURL = readData.find('img').toArray();
    imageURL.forEach((function(i) {
      $('#wiki').append('<div><img src="' + i.src + '"/></div>');
    }));
  }
})();
