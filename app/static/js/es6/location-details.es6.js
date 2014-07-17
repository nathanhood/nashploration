/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    showStreetView();
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
    $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=Tennessee&callback=?`).done(function(data){
      var stuff = data.parse.text;
      $('#wiki').append(stuff["*"]);
    });
  }




})();
