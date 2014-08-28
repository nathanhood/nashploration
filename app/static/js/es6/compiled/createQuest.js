(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('#view-quest-map').click(toggleMapAndList);
    $('#view-quest-list').click(toggleMapAndList);
    $('#add-location').click(showMap);
    $('#create-quest-map').on('click', '.add-to-quest', addToQuest);
    $('#create-quest-map').on('click', '.remove-from-quest', removeFromQuest);
    $('#quest-list').on('click', 'button', removeFromQuest);
    $('#add-group-to-quest').click(showGroupOptions);
    $('#cancel-group-to-quest').click(hideGroupOptions);
    $('#confirm-group-to-quest').click(confirmGroup);
    $('#clear-group-to-quest').click(clearGroupOptions);
  }
  function fetchLocations() {
    $.ajax('/getAllLocations').done(function(data) {
      initMap();
      data.forEach((function(d) {
        placeMarkers(d.loc, d.name, d.description, d._id);
        buildLocationsListing(d);
      }));
      resizeMap();
    });
  }
  function buildLocationsListing(location) {
    var description = 'no description';
    if (location.description !== null) {
      description = (location.description.substr(0, 40) + "...");
    }
    var listing = ("<li class=\"location-listing\", data-id=" + location._id + ">" + location.name + "<br><p>" + description + "</p></li>");
    $('#quest-locations-listing').append(listing);
  }
  function filterLocations() {
    var filter = $('#map-filter').find('option:selected').text();
    switch (filter) {
      case 'All':
        $.ajax('/getAllLocations').done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Civil War Sites':
        $.ajax('/getCivilWarLocations').done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        $.ajax('/getAndrewJacksonLocations').done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
    }
  }
  function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[$traceurRuntime.toProperty(i)].setMap(map);
    }
  }
  function clearMap() {
    coordinates = [];
    setAllMap(null);
  }
  var map;
  function initMap() {
    var startLatLng = new google.maps.LatLng(36.1667, -86.7833);
    var mapOptions = {
      zoom: 14,
      center: startLatLng,
      draggableCursor: 'crosshair'
    };
    map = new google.maps.Map(document.getElementById('create-quest-map'), mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
      checkCloseLocs(event.latLng);
    });
  }
  var markers = [];
  var coordinates = [];
  function placeMarkers(coords, locName, locDesc, locationId) {
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);
    latLng = new google.maps.Marker({
      position: latLng,
      map: map
    });
    markers.push(latLng);
    infoWindows(locName, latLng, locDesc, locationId);
    google.maps.event.addListener(latLng, 'click', checkLocationInQuest);
  }
  function resizeMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < coordinates.length; i++) {
      latlngbounds.extend(coordinates[$traceurRuntime.toProperty(i)]);
    }
    map.fitBounds(latlngbounds);
  }
  var allInfoWindows = [];
  function infoWindows(siteName, windowLoc, locDesc, locationId) {
    var siteURL = siteName.toLowerCase().split(' ').join('-');
    if (locDesc === null) {
      locDesc = 'There is no description for this site.';
    }
    var content = '<h3>' + siteName + '</h3>' + '<p>' + locDesc + '</p>' + '<a href="/locations/' + siteURL + '", class="info-window">Show More</a>' + '<button class=add-to-quest data-id=' + locationId + '>Add To Quest</button>' + '<button class=remove-from-quest data-id=' + locationId + '>Remove From Quest</button>';
    siteName = new google.maps.InfoWindow();
    siteName.setContent(content);
    allInfoWindows.push(siteName);
    google.maps.event.addListener(windowLoc, 'click', function() {
      allInfoWindows.forEach((function(w) {
        w.close();
      }));
      siteName.open(map, windowLoc);
    });
  }
  var questLocations = [];
  function showMap() {
    $('#create-quest-map').fadeIn('slow');
    $('#view-quest-list').fadeIn('slow');
    $('#add-location').hide();
    $('#view-current-quest').show();
  }
  function toggleMapAndList() {
    var button = $(this).attr('id');
    var list = $('#quest-locations-listing');
    var map = $('#create-quest-map');
    $(this).hide();
    if (button === 'view-quest-map') {
      list.fadeOut();
      map.fadeIn();
      $('#view-quest-list').show();
    } else if (button === 'view-quest-list') {
      map.fadeOut();
      list.fadeIn();
      $('#view-quest-map').show();
    }
  }
  function checkLocationInQuest() {
    var locationId = $('.add-to-quest').data('id');
    if (isLocationInQuest(locationId)) {
      $('.add-to-quest').hide();
    } else {
      $('.remove-from-quest').hide();
    }
  }
  function swapInfoWindowButtons(boolean) {
    if (boolean === true) {
      $('.add-to-quest').hide();
      $('.remove-from-quest').show();
    } else if (boolean === false) {
      $('.remove-from-quest').hide();
      $('.add-to-quest').show();
    }
  }
  function addToQuest() {
    var id = $(this).data('id');
    var title = $(this).siblings('h3').text();
    if (!isLocationInQuest(id)) {
      questLocations.push(id);
      addToQuestList(title, id);
      updateQuestForm();
      swapInfoWindowButtons(true);
    }
  }
  function removeFromQuest() {
    var id = $(this).data('id');
    var title;
    questLocations = questLocations.filter((function(record) {
      if (record !== id) {
        return record;
      }
    }));
    removeFromQuestList(title, id);
    updateQuestForm();
    if ($(this).hasClass('remove-from-quest') || $(this).hasClass('quest-listing')) {
      swapInfoWindowButtons(false);
    }
  }
  function addToQuestList(title, id) {
    var newLocation = $('<li>').text(title).attr('id', id);
    var button = $('<button class=quest-listing>').text('X').data('id', id);
    $(newLocation).append(button);
    $('#quest-list ul').append(newLocation);
  }
  function removeFromQuestList(title, id) {
    var location = $(("#" + id));
    $(location).remove();
  }
  function updateQuestForm() {
    $('#location-ids').val(questLocations);
  }
  function isLocationInQuest(id) {
    var questLocation = questLocations.filter((function(record) {
      if (record === id) {
        return record;
      }
    }));
    if (questLocation.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  function showGroupOptions() {
    $('.group-quest-options').show();
    $('#cancel-group-to-quest, #confirm-group-to-quest').show();
    $('#add-group-to-quest, #change-group-to-quest').hide();
  }
  function hideGroupOptions() {
    $('.group-quest-options').hide();
    $('#cancel-group-to-quest, #confirm-group-to-quest').hide();
    $('#add-group-to-quest').show();
    $('.group-to-quest').each((function(i, input) {
      $(input).attr('checked', false);
    }));
  }
  function clearGroupOptions() {
    $('#selected-groups').val('');
    $('#quest-groups-list').empty();
    $('#clear-group-to-quest').hide();
    $('#add-group-to-quest').show();
    $('.group-to-quest').each((function(i, input) {
      $(input).attr('checked', false);
    }));
  }
  function confirmGroup() {
    var groupIds = [];
    $('.group-to-quest:checked').each((function(i, input) {
      var groupId = $(input).attr('id');
      groupIds.push(groupId);
      var groupName = $(input).val();
      var listItem = ("<li>" + groupName + "</li>");
      $('#quest-groups-list').append(listItem);
    }));
    $('#selected-groups').val(groupIds);
    var selected = $('#selected-groups').val();
    showClearGroupOptions();
  }
  function showClearGroupOptions() {
    $('.group-quest-options').hide();
    $('#cancel-group-to-quest, #confirm-group-to-quest').hide();
    $('#clear-group-to-quest').show();
  }
  function ajax(url, type) {
    var data = arguments[2] !== (void 0) ? arguments[2] : {};
    var success = arguments[3] !== (void 0) ? arguments[3] : (function(r) {
      return console.log(r);
    });
    var dataType = arguments[4] !== (void 0) ? arguments[4] : 'html';
    $.ajax({
      url: url,
      type: type,
      dataType: dataType,
      data: data,
      success: success
    });
  }
})();
