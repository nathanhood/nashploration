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

//=======ajax call to fetch locations from the database: Richmond
  function fetchLocations() {
    $.ajax('/getAllLocations').done(function(data){
      initMap();

      data.forEach(d=>{
        placeMarkers(d.gis, d.name, d.description);
      });
      resizeMap();
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
          resizeMap();
        });
        break;
      case 'Civil War Sites':
        $.ajax('/getCivilWarLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.gis, d.name, d.description);
          });
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        $.ajax('/getAndrewJacksonLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.gis, d.name, d.description);
          });
          resizeMap();
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
    coordinates = []; //clears coordinates so that the latlngbounds variable can be reset in the resize function
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
  var coordinates = []; // made coordinates global so the map can be resized each time its filtered
  function placeMarkers(coords, locName, locDesc, animation){
    var latLng = new google.maps.LatLng(coords.lat, coords.long);
      coordinates.push(latLng);
      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map
      });
      markers.push(latLng);
      infoWindows(locName, latLng, locDesc, coords); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link

  }

//======resizes the map to to just fit the available markers: Richmond
  function resizeMap(){
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < coordinates.length; i++) {
        latlngbounds.extend(coordinates[i]);
    }
    map.fitBounds(latlngbounds);
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
    '<a href="/locations/'+siteURL+'", class="info-window">Show More</a>';

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

//===== pulls up for the street view when show more is click in an info window: Richmond
  function showStreetView (){
    var lat = $(this).attr('data-lat'); //grabs the coordinate data which is stored in the show more link of each infowindow
    var long = $(this).attr('data-long');
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
