/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
    $('.remove-quest').click(removeQuest);
  }


  function removeQuest(event){
    var questId = $('.quest-name').data('id');
    var r = confirm('Are you sure you want to remove this quest?\nAll progress will be lost.');
    if (r === true) {
      $('.remove-quest-form').submit();
    }
    event.preventDefault();
  }


var allMarkers = [];
//=======ajax call to fetch locations from the database: Richmond
function fetchLocations() {
  var questId = $('.quest-name').data('id');
  $.ajax(`/getQuestLocations/${questId}`).done(function(data){

    createQuestList(data);
    initMap();

    data.forEach(a=>{
      placeMarkers(a.loc, a.name, a.description);
    });

    resizeMap();
  });
}

function createQuestList(questLocations){
  questLocations.forEach(location=>{
    var destination = `<li class='quest-destination'>
                      <h3>${location.name}</h3>
                      <p><b>Address</b>: ${location.address}<p>
                      <p><b>Description</b>: ${location.description}</p>
                    </li>`;
    $('.quest-destinations').append(destination);
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
    map = new google.maps.Map(document.getElementById('quest-map-canvas'), mapOptions);
}

//====adds all historical markers to the map: Richmond
var markers = []; // made markers global for deletion
var coordinates = []; // made coordinates global so the map can be resized each time its filtered
function placeMarkers(coords, locName, locDesc){
  var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);

    latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
     position: latLng,
     map: map
    });

    markers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link

}


var questIcon = {
    url: '/img/pin-filled.svg',
    scaledSize: new google.maps.Size(40,40)
  };

var questMarkers = [];
function placeQuestMarkers(coords, locName, locDesc){
  var latLng = new google.maps.LatLng(coords[1], coords[0]);

    latLng = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: questIcon
    });

    questMarkers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc);
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



  function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
    $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
  }


})();
