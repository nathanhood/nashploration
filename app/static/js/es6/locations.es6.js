/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    sizeMarkers();
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    fadeConfirmMessage();
    $('.checkin-button').click(submitCheckInListForm);
    $('.notification-icon').click(showNotification);
    $('a#dismiss').click(hideNotification);
  }

  var defaultMarker;
  var checkInMarker;
  var questIcon;

  function sizeMarkers() {

    var width = 25;
    var height = 39;


    defaultMarker = {
      url: 'img/assets/pins/pin-orange.png',
      scaledSize: new google.maps.Size(width,height),
      flatten: true,
      optimized: true

    };

    checkInMarker = {
      url: '/img/assets/pins/pin-blue.png',
      scaledSize: new google.maps.Size(width,height),
      optimized: true
    };

    questIcon = {
      url: '/img/assets/pins/pin-blue-orange.png',
      scaledSize: new google.maps.Size(width,height),
      optimized: true
    };
  }

  function submitCheckInListForm(event){
    $('form.checkin-form').submit();
    event.preventDefault();
  }

  var allMarkers = [];
//=======ajax call to fetch locations from the database: Richmond
  function fetchLocations() {
    $.ajax('/getFilteredLocations').done(function(data){
      initMap();

      if(data.quest){
        data.quest.forEach(q=>{
          placeQuestMarkers(q.loc, q.name, q.description, q._id);
        });
      }

      data.all.forEach(a=>{
        placeMarkers(a.loc, a.name, a.description, a._id);
      });

      if(data.checkIns){
        data.checkIns.forEach(c=>{
          placeCheckInMarkers(c.loc, c.name, c.description, c._id);
        });
      }
      
      map.setZoom(12);
    });
  }

  function removeAllDups(data) {
    for (var i = 0; i < data.length; i++) {
        var found = false,
            num = data[i].number;
        for (var j = i+1; j < data.length; j++) {
            if (data[j].number === num) {
                found = true;
                data.splice(j--, 1);
            }
        }
        if (found) {
            data.splice(i--, 1);
        }
    }
    return data;
}

//===========filtering map :Nathan
  function filterLocations() {
    var filter = $('#map-filter').find('option:selected').text();
    var params;
    switch(filter) {
      case 'All':
        fetchLocations();
        break;
      case 'Civil War Sites':
        params = 'Civil War Sites';
        $.ajax('/getFilteredLocations/'+ params).done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        params = 'Andrew Jackson';
        $.ajax('/getFilteredLocations/'+ params).done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Schools':
        params = 'School';
        $.ajax('/getFilteredLocations/'+ params).done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Cemeteries':
        params = 'Cemetery';
        $.ajax('/getFilteredLocations/'+ params).done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Churches':
        params = 'Church';
        $.ajax('/getFilteredLocations/'+ params).done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Active Quest':
        $.ajax('/getActiveQuestLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeQuestMarkers(d.loc, d.name, d.description, d._id);
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

    for (var j = 0; j < questMarkers.length; j++){
      questMarkers[j].setMap(map);
    }

    for (var l = 0; l < checkInMarkers.length; l++){
      checkInMarkers[l].setMap(map);
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
      center: startLatLng
    };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      google.maps.event.addListener(map, 'click', function(event) { //TODO remove this after testing...this simulates the current location coordinates
         checkCloseLocs(event.latLng);
         setMapGeo(false);
      });

      google.maps.event.addListener(map, 'dragend', function(event) {
         setMapGeo(false);
      });

      
      google.maps.event.addListener(map, 'zoom_changed', function(event) {
         setMapGeo(false);
      });

      $('#geolocation-control').click(setMapGeo);

  }

//====adds all historical markers to the map: Richmond
  var markers = []; // made markers global for deletion
  var coordinates = []; // made coordinates global so the map can be resized each time its filtered

  function placeMarkers(coords, locName, locDesc, id){
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
      coordinates.push(latLng);

      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map,
       icon: defaultMarker
      });

      markers.push(latLng);
      allMarkers.push(latLng);
      infoWindows(locName, latLng, locDesc, id); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link

  }


  var checkInMarkers = [];
  function placeCheckInMarkers(coords, locName, locDesc, id){
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
      coordinates.push(latLng);

      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map,
       icon: checkInMarker
      });

      checkInMarkers.push(latLng);
      allMarkers.push(latLng);
      infoWindows(locName, latLng, locDesc, id); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link

  }


  var questMarkers = [];
  function placeQuestMarkers(coords, locName, locDesc, id){
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);

      latLng = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: questIcon
      });

      questMarkers.push(latLng);
      allMarkers.push(latLng);
      infoWindows(locName, latLng, locDesc, id);
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
  function infoWindows(siteName, windowLoc, locDesc, id){
    if(locDesc === null){
      locDesc = 'There is no description for this site.';
    }

    var content = '<div class="pop-up-window"><h3 class="pop-up-title">' + siteName + '</h3>'+
    '<p class="pop-up-description">' + locDesc + '</p>'+
    '<a href="/locations/show/'+id+'", class="info-window pop-up-link">Show More</a></div>';
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


//either a jquery click event object is passed in from the click handler turning geolocation on or a boolean 
//from the google drag/click event listeners which turns it off
  var timer;
  function setMapGeo(geoBool){
    if(typeof geoBool === 'object'){ 
      findLocation();
      timer = setInterval(function(){
        findLocation();
      }, 5000);
    } else{
      clearInterval(timer);
    }
  }

  var currLocMarker = {
     path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
     strokeColor: 'darkgreen',
     scale: 5
  };

// ========Used to find users current location: Richmond
  var pos;
  var userLocMarker;
  function findLocation(){
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
         pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
       if(userLocMarker){
         userLocMarker.setMap(null);
       } 

        userLocMarker = new google.maps.Marker({
          map: map,
          position: pos,
          icon: currLocMarker
        });

        map.setCenter(pos);
        map.setZoom(16);

        checkCloseLocs(pos);
      }, function() {
        handleNoGeolocation(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
  }

function handleNoGeolocation(errorFlag) {
  var content;
  if (errorFlag) {
     content = 'Error: The Geolocation service failed.';
  } else {
     content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position:  new google.maps.LatLng(36.1667, -86.7833),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

//checks for nearby locations and resets markers on previous nearby locations that are no long in range: Richmond
var currentLat;
var currentLong;
function checkCloseLocs(pos){
  // currentLat= pos.k;
  // currentLong = pos.A; google is messing with us
  currentLat= pos.k;
  currentLong = pos.B;

  if(closeMarkers.length){
    resetMarkers();
  }

  $.ajax(`/getCloseLocs/${currentLat}/${currentLong}`).done(function(data){
    var nearbyIds = []; // for nearby checkins list page
    data.forEach(i=>{
      nearbyIds.push(i._id);
      addCheckInMarkers(i.loc);
      addCheckInButton(i.name, i.description, i._id);
    });
    $('.checkin-form input').val(nearbyIds);
  });
}

//==== changes the icons for the markers that are within range of checkin: Richmond
var closeMarkers = [];
function addCheckInMarkers(coords){
    allMarkers.forEach(m=>{ // loops thourgh the global array of markers and matches on the site coordinates. When it finds a match it changes the marker icon.
      if(m.position.k.toFixed(6) === coords[1].toFixed(6) && m.position.B.toFixed(6) === coords[0].toFixed(6)){
        // m.setAnimation(google.maps.Animation.BOUNCE);
        toggleBounce(m);
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

      var content = '<div class="pop-up">'+
      '<h3 class="pop-up-title">'+windowName+'</h3>'+
      '<p class="pop-up-p">'+description+'</p>'+
      '<a href="/locations/show/'+id+'", class="info-window pop-up-link">Show More</a>'+ //id is the locations mongo id
      '<a href="/checkIn/'+id+'", class="checkin-button pop-up-link">Check In</a>'+'</div>'; //onclick="'+checkIn()+'"

      w.setContent(content);
    }
  });
  closeLocations.push(windowName);
}

function toggleBounce (m) {
  m.setAnimation(google.maps.Animation.BOUNCE);
     google.maps.event.addListener(m, 'click', function () {
       m.setAnimation(null);
    });
}

function resetMarkers(){
  closeMarkers.forEach(i=>{
    i.setAnimation(null);
  });
  closeMarkers = [];
}

function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
$.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
}

function fadeConfirmMessage(){
  setTimeout(function(){
    $('.home-messages').fadeOut('slow');
  }, 4000);
}

function showNotification(){
  $('.notification-wrapper').fadeToggle();
}

function hideNotification(){
  $('.notification-wrapper').fadeOut();
}

})();
