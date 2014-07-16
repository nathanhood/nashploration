/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('body').on('click', '.info-window', showStreetView);
  }


function showStreetView (){
  var lat = $(this).attr('data-lat');
  var long = $(this).attr('data-long');
  console.log(lat);
  console.log(long);
}


//=======ajax call to fetch locations from the database: Richmond
  function fetchLocations() {
    $.ajax('/getAllLocations').done(function(data){
      initMap();

      data.forEach(d=>{
        placeMarkers(d.gis, d.name, d.description);
      });
    });
  }

//===========filtering map :Nathan
  function filterLocations() {
    var filter = $('#map-filter').find('option:selected').text();
    switch(filter) {
      case 'All':
        $.ajax('/getAllLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.gis, d.name, d.description);
          });
        });
        break;
      case 'Civil War Sites':
        $.ajax('/getCivilWarLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.gis, d.name, d.description);
          });
        });
        break;
    }
  }


//========== methods to clear markers from map: Nathan
  function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  function clearMap() {
    setAllMap(null);
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
  var markers = []; // made markers global for deletion
  function placeMarkers(coords, locName, locDesc){
    var latLng = new google.maps.LatLng(coords.lat, coords.long);
      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map
      //  animation: google.maps.Animation.DROP
      });
      markers.push(latLng);
      infoWindows(locName, latLng, locDesc, coords); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link
  }

//====sets and opens infowindows: Richmond
  // var infowindow; //set to global so that only one infowindow can be open at a time -- close them using forEach in google listener function below
  var allInfoWindows = [];
  function infoWindows(siteName, windowLoc, locDesc, coords){
    var lat = coords.lat;
    var long = coords.long;
    var siteURL = siteName.toLowerCase().split(' ').join('-');
    if(locDesc === null){
      locDesc = 'There is no description for this site.';
    }

    var content = '<h3>' + siteName + '</h3>'+
    '<p>' + locDesc + '</p>'+
    '<a href="#", class="info-window", data-lat="'+lat+'", data-long="'+long+'">Show More</a>';

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

  // function wikiTest(place) {
  //   console.log(place);
  //   var np = place.toLowerCase().split(' ').join('_');
  //   console.log(np);
  //   $.getJSON(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${np}&callback=?`).done(function(data){
  //     console.log(data);
  //   });
  // }
  //



})();
