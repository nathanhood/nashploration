/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
  }


//=======ajax call to fetch locations from the database: Richmond
  function fetchLocations() {
    $.ajax('/getLocations').done(function(data){
      initMap();
      data.forEach(d=>{
        placeMarkers(d.gis, d.name);
      });
    });
  }

//======initialize main map: Richmond
  var map; //set as a global variable to be used in placeMarkers function
  function initMap() {
    var startLatLng = new google.maps.LatLng(36.1667, -86.7833);
    var mapOptions = {
      zoom: 11,
      center: startLatLng,
      draggableCursor: 'crosshair'
    };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  }

//====adds all historical markers to the map: Richmond
  var markers = []; //set as global so that markers can easily be cleared
  var marker;
  function placeMarkers(coords, locName){
    var latLng = new google.maps.LatLng(coords[0], coords[1]);
      latLng = new google.maps.Marker({
       position: latLng,
       map: map,
       animation: google.maps.Animation.DROP
    });
    markers.push(marker);

    infoWindows(locName, latLng);
  }


function infoWindows(name, coords){
  var infowindow = new google.maps.InfoWindow();
    infowindow.setContent(name);
    // infowindow.open(favLocMap, favCoords);
    google.maps.event.addListener(coords, 'click', function() {
    infowindow.open(map, coords);
  });
}




})();
