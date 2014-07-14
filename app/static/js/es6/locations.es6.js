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
        placeMarkers(d.gis, d.name, d.description);
      });
    });
  }

//======initialize main map: Richmond
  var map; //set as a global variable to be used in placeMarkers function
  function initMap() {
    var startLatLng = new google.maps.LatLng(36.1667, -86.7833);
    var mapOptions = {
      zoom: 14,
      center: startLatLng,
      draggableCursor: 'crosshair'
    };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  }

//====adds all historical markers to the map: Richmond
  var markers = []; //set as global so that markers can easily be cleared
  function placeMarkers(coords, locName, locDesc){
    var latLng = new google.maps.LatLng(coords[0], coords[1]);
      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map,
       animation: google.maps.Animation.DROP
      });
      markers.push(latLng);
      infoWindows(locName, latLng, locDesc);
  }

//====sets and opens infowindows: Richmond
  // var infowindow; //set to global so that only one infowindow can be open at a time
  var allInfoWindows = [];
  function infoWindows(siteName, windowLoc, locDesc){
    var content = '<h3>' + siteName + '</h3>'+
    '<p>' + locDesc + '</p>'+
    '<a href=/show/'+siteName+'>Show More</a>';

      siteName = new google.maps.InfoWindow();
      siteName.setContent(content);
      allInfoWindows.push(siteName); //since all windows have diff variable names, they are pushed into an array so they can be closed on the opening of another window

      google.maps.event.addListener(windowLoc, 'click', function() {
        allInfoWindows.forEach(w=>{
          w.close();
        });
        siteName.open(map, windowLoc);
    });
  }






})();
