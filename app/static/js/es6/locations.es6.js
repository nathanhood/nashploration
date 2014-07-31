/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('body').on('click', '.info-window', showStreetView);
    // findLocation();
    // checkCloseLocs();
    // $('body').on('click', '.checkin-button', checkIn);
  }

//=======ajax call to fetch locations from the database: Richmond
  function fetchLocations() {
    $.ajax('/getAllLocations').done(function(data){
      initMap();

      data.forEach(d=>{
        placeMarkers(d.loc, d.name, d.description);
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
            placeMarkers(d.loc, d.name, d.description);
          });
          resizeMap();
        });
        break;
      case 'Civil War Sites':
        $.ajax('/getCivilWarLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description);
          });
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        $.ajax('/getAndrewJacksonLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description);
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

      google.maps.event.addListener(map, 'click', function(event) { //TODO remove this after testing...this simulates the current location coordinates
         checkCloseLocs(event.latLng);
      });
  }

//====adds all historical markers to the map: Richmond
  var markers = []; // made markers global for deletion
  var coordinates = []; // made coordinates global so the map can be resized each time its filtered
  function placeMarkers(coords, locName, locDesc, animation){
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
      coordinates.push(latLng);
      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map
      });
      markers.push(latLng);
      infoWindows(locName, latLng, locDesc); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link

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
  function infoWindows(siteName, windowLoc, locDesc){
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

  var currLocMarker = {
    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
    strokeColor: 'darkgreen',
    scale: 5
  };
//========Used to find users current location: Richmond
//   function findLocation(){
//   if(navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//       var marker = new google.maps.Marker({
//         map: map,
//         position: pos,
//         icon: currLocMarker
//       });
//
//       map.setCenter(pos);
//       checkCloseLocs(pos);
//     }, function() {
//       handleNoGeolocation(true);
//     });
//   } else {
//     // Browser doesn't support Geolocation
//     handleNoGeolocation(false);
//   }
//
// }
//
// function handleNoGeolocation(errorFlag) {
//   var content;
//   if (errorFlag) {
//      content = 'Error: The Geolocation service failed.';
//   } else {
//      content = 'Error: Your browser doesn\'t support geolocation.';
//   }
//
//   var options = {
//     map: map,
//     position: new google.maps.LatLng(60, 105),
//     content: content
//   };
//
//   var infowindow = new google.maps.InfoWindow(options);
//   map.setCenter(options.position);
// }

//TODO change timed function to findLocation()
//   window.setInterval(function(){
//   checkCloseLocs();
// }, 10000);

//TODO pass in pos once mongo geo spatial is working
//sends an ajax call to find all of the locations that the user is within a close enough range to check into: Richmond

//checks for nearby locations and resets markers on previous nearby locations that are no long in range: Richmond
function checkCloseLocs(pos){
  var lat = pos.k; // 36.1667;
  var long = pos.B; //-86.7833;

  if(closeMarkers.length){
    resetMarkers();
  }

  if(closeLocations.length){  //if there are nearby locations currently displaying and the user moves this call resets markers that are no longer in range of user and sets ones that now are: Richmond
    $.ajax(`/resetCloseLocations/${closeLocations}`).done(function(data){
      data.forEach(d=>{
        if(d){  //if database returns null, it throws an error and does not recover until page refresh..this prevents that
        placeMarkers(d.loc, d.name, d.description);
      }
      });

      $.ajax(`/getCloseLocs/${lat}/${long}`).done(function(data){
        data.forEach(i=>{
          addCheckInMarkers(i.loc);
          addCheckInButton(i.name, i.description, i._id);
        });
      });
    });
  } else {
    $.ajax(`/getCloseLocs/${lat}/${long}`).done(function(data){
      data.forEach(i=>{
        addCheckInMarkers(i.loc);
        addCheckInButton(i.name, i.description, i._id);
      });
    });
  }
closeLocations = [];
}


var checkInIcon = {
    url: '/img/pin-dot.svg',
    scaledSize: new google.maps.Size(40,40)
  };

//==== changes the icons for the markers that are within range of checkin: Richmond
var closeMarkers = [];
function addCheckInMarkers(coords){
    markers.forEach(m=>{ // loops thourgh the global array of markers and matches on the site coordinates. When it finds a match it changes the marker icon.
      if(m.position.k.toFixed(6) === coords[1].toFixed(6) && m.position.B.toFixed(6) === coords[0].toFixed(6)){
        m.setIcon(checkInIcon);
        closeMarkers.push(m);
      }
    });
}
//==== adds "Check In" buttons to info windows that are within range of checkin: Richmond
var closeLocations = [];
function addCheckInButton(windowName, description, id){
  allInfoWindows.forEach(w=>{   //loops through the global arraay of info windows looking for a match on the site name. If it finds a match it adds a checkin button to the window
    var siteURL = windowName.toLowerCase().split(' ').join('-');
    if(description === null){
      description = 'There is no description for this site.';
    }

    if(w.content.match(windowName)){
      var content = '<h3>'+windowName+'</h3>'+
      '<p>'+description+'</p>'+
      '<a href="/locations/'+siteURL+'", class=info-window>Show More</a>'+ //id is the locations mongo id
      '<a href="/checkIn/'+id+'", class="checkin-button"> <button>Check In</button></a>'; //onclick="'+checkIn()+'"

      w.setContent(content);
    }


  });
  closeLocations.push(windowName);
}


function resetMarkers(){
  closeMarkers.forEach(i=>{
    i.setMap(null);
  });
  closeMarkers = [];
}

function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
$.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
}



})();
