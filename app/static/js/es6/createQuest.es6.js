/* global google:true */
/* jshint unused: false, undef: false, camelcase: false*/

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);

    /* ----------- Add Location to Quest --------- */
    $('#create-quest-map').on('click', '.add-to-quest', addToQuest);
    $('#create-quest-map').on('click', '.remove-from-quest', removeFromQuest);
    $('#quest-list').on('click', 'button', removeFromQuest);

    /* ------- Adding Group to Quest --------- */
    $('#add-group-to-quest').click(showGroupOptions);
    $('#cancel-group-to-quest').click(hideGroupOptions);
    $('#confirm-group-to-quest').click(confirmGroup);
    $('#clear-group-to-quest').click(clearGroupOptions);
    // $('#quest-groups-list').on('click', '.quest-group-item', removeGroupFromQuest);
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

    google.maps.event.addListener(latLng, 'click', checkLocationInQuest);
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

  //========== Adding Location Ids to Quest List (questLocations array)
  var questLocations = [];

  function checkLocationInQuest(){
    var locationId = $('.add-to-quest').data('id');
    if (isLocationInQuest(locationId)) {
      $('.add-to-quest').hide();
    } else {
      $('.remove-from-quest').hide();
    }
  }

  function swapInfoWindowButtons(boolean){
    if (boolean === true) {
      $('.add-to-quest').hide();
      $('.remove-from-quest').show();
    } else if (boolean === false) {
      $('.remove-from-quest').hide();
      $('.add-to-quest').show();
    }
  }

  function addToQuest(){
    var id = $(this).data('id');
    var title = $(this).siblings('h3').text();
    if (!isLocationInQuest(id)) {
      questLocations.push(id);
      addToQuestList(title, id);
      updateQuestForm();
      swapInfoWindowButtons(true);
    }
  }

  function removeFromQuest(){
    var id = $(this).data('id');
    var title;
    questLocations = questLocations.filter((record)=>{
      if (record !== id) {
        return record;
      }
    });
    removeFromQuestList(title, id);
    updateQuestForm();
    if ($(this).hasClass('remove-from-quest') || $(this).hasClass('quest-listing')) {
      swapInfoWindowButtons(false);
    }
  }

  function addToQuestList(title, id){
    var newLocation = $('<li>').text(title).attr('id', id);
    var button = $('<button class=quest-listing>').text('X').data('id', id);
    $(newLocation).append(button);
    $('#quest-list ul').append(newLocation);
  }

  function removeFromQuestList(title, id){
    var location = $(`#${id}`);
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


  //============ Add Group To Quest ===============

  function showGroupOptions(){
    $('.group-quest-options').show();
    $('#cancel-group-to-quest, #confirm-group-to-quest').show();
    $('#add-group-to-quest, #change-group-to-quest').hide();
  }

  function hideGroupOptions(){
    $('.group-quest-options').hide();
    $('#cancel-group-to-quest, #confirm-group-to-quest').hide();
    $('#add-group-to-quest').show();

    $('.group-to-quest').each((i,input)=>{
      $(input).attr('checked', false);
    });
  }

  function clearGroupOptions(){
    $('#selected-groups').val('');
    $('#quest-groups-list').empty();
    $('#clear-group-to-quest').hide();
    $('#add-group-to-quest').show();

    $('.group-to-quest').each((i,input)=>{
      $(input).attr('checked', false);
    });
  }

  function confirmGroup(){
    var groupIds = [];
    $('.group-to-quest:checked').each((i, input)=>{
      var groupId = $(input).attr('id');
      groupIds.push(groupId);
      var groupName = $(input).val();
      var listItem = `<li>${groupName}</li>`;
      $('#quest-groups-list').append(listItem);
    });
    $('#selected-groups').val(groupIds);
    var selected = $('#selected-groups').val();
    showClearGroupOptions();
  }

  function showClearGroupOptions(){
    $('.group-quest-options').hide();
    $('#cancel-group-to-quest, #confirm-group-to-quest').hide();
    $('#clear-group-to-quest').show();
  }

  // function removeGroupFromQuest(){
  //   var idToRemove = $(this).data('id');
  //   console.log(idToRemove);
  //   var updatedList = $('#selected-groups').val().split(',').filter(groupId=>{
  //     if (groupId !== idToRemove) {
  //       return groupId;
  //     }
  //   });
  //   $(this).parent('li').remove();
  //   $('#selected-groups').val(updatedList);
  // }


  function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
    $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
  }


})();
