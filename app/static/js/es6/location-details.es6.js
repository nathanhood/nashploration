/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    showStreetView();
    // callWikipediaAPI('tennessee');
  }


//===== pulls up for the street view when show more is click in an info window: Richmond
  function showStreetView (){
    var lat = $('#coords').attr('data-lat'); //grabs the coordinate data which is stored in the show more link of each infowindow
    var long = $('#coords').attr('data-long');
    var streetLatLng = new google.maps.LatLng(lat, long);

    var panoOptions = {
      position: streetLatLng,
      addressControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_CENTER
      },
      linksControl: false,
      panControl: false,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      },
      enableCloseButton: false
    };

    var streetView = new google.maps.StreetViewPanorama(
      document.getElementById('street-view'), panoOptions);
      wikiTest();
  }



    function wikiTest() {
    $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&prop=text|images&callback=?`).done(function(data){
      // console.log(data);
      wikipediaHTMLResult(data);
    });
  }


  function wikipediaHTMLResult (data) {

    var readData = $('<div>' + data.parse.text['*'] + '</div>');

    var box = readData.find('.infobox').toArray();

    var info = readData.find('p').first()[0].textContent;

    $('#wiki-description').text(info);

    var imageURL = readData.find('img').toArray();
    imageURL.forEach(i=>{
      $('#wiki').append('<div><img src="'+ i.src + '"/></div>');
    });

  }

})();
