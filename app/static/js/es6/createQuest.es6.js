/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('#create-quest-map').on('click', '.add-to-quest', addToQuest);
    $('#create-quest-map').on('click', '.remove-from-quest', removeFromQuest);
    $('#quest-list').on('click', 'button', removeFromQuest);
    // findLocation();
  }

//=======ajax call to fetch locations from the database: Richmond
  function fetchLocations() {
    $.ajax('/getAllLocations').done(function(data){
      initMap();

      data.forEach(d=>{
        placeMarkers(d.loc, d.name, d.description, d._id);
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
            console.log(d);
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Civil War Sites':
        $.ajax('/getCivilWarLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
          });
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        $.ajax('/getAndrewJacksonLocations').done(function(data){
          clearMap();
          data.forEach(d=>{
            placeMarkers(d.loc, d.name, d.description, d._id);
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
      map = new google.maps.Map(document.getElementById('create-quest-map'), mapOptions);

      google.maps.event.addListener(map, 'click', function(event) { //TODO remove this after testing...this simulates the current location coordinates
         checkCloseLocs(event.latLng);
      });
  }

//====adds all historical markers to the map: Richmond
  var markers = []; // made markers global for deletion
  var coordinates = []; // made coordinates global so the map can be resized each time its filtered
  function placeMarkers(coords, locName, locDesc, locationId){
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
      coordinates.push(latLng);
      latLng = new google.maps.Marker({  //latlng is the marker variable name so that each marker has a unique variable(makes infowindows show in correct location)
       position: latLng,
       map: map
      });
      markers.push(latLng);
      infoWindows(locName, latLng, locDesc, locationId); //passing in coords because latLng is now a google Marker Object..coords is used to set the data of the infowindow "Show More" link

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
  var allInfoWindows = [];
  function infoWindows(siteName, windowLoc, locDesc, locationId){
    var siteURL = siteName.toLowerCase().split(' ').join('-');
    if(locDesc === null){
      locDesc = 'There is no description for this site.';
    }

    var content = '<h3>' + siteName + '</h3>'+
    '<p>' + locDesc + '</p>'+
    '<a href="/locations/'+siteURL+'", class="info-window">Show More</a>'+
    '<button class=add-to-quest data-id='+locationId+'>Add To Quest</button>'+
    '<button class=remove-from-quest data-id='+locationId+'>Remove From Quest</button>';
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

  //========== Adding Location Ids to Global Array
  var questLocations = [];

  function addToQuest(){
    var id = $(this).data('id');
    var title = $(this).siblings('h3').text();
    if (!isLocationInQuest(id)) {
      questLocations.push(id);
      addToQuestList(title, id);
      updateQuestForm();
    }
  }

  function removeFromQuest(){
    var id = $(this).data('id');
    var title;
    if ($(this).parent().is('div')) {
      title = $(this).siblings('h3').text();
    } else {
      title = $(this).parent('li').text();
    }
    questLocations = questLocations.filter((record)=>{
      if (record !== id) {
        return record;
      }
    });
    removeFromQuestList(title, id);
    updateQuestForm();
  }

  function addToQuestList(title, id){
    var newLocation = $('<li>').text(title);
    var button = $('<button>').text('X').data('id', id);
    $(newLocation).append(button);
    $('#quest-list ul').append(newLocation);
  }

  function removeFromQuestList(title, id){
    var location = $('#quest-list').find('li:contains('+title+')');
    $(location).remove();
  }

  function updateQuestForm(){
    $('#location-ids').val(questLocations);
  }

  function isLocationInQuest(id){
    var questLocation = questLocations.filter((record)=>{
      if (record === id) {
        return record;
      }
    });
    if (questLocation.length > 0) {
      return true;
    } else {
      return false;
    }
  }


  function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
    $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
  }


})();
