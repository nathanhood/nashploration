(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('#view-quest-map').click(toggleMapAndList);
    $('#view-quest-list').click(toggleMapAndList);
    $('#add-location').click(viewAddLocationsToQuest);
    $('#view-current-quest').click(showQuestAndGroups);
    $('#submit-quest-form').click(submitQuest);
    $('#create-quest-map').on('click', '.add-to-quest', addToQuestFromMap);
    $('#create-quest-map').on('click', '.remove-from-quest', removeFromQuest);
    $('#quest-list').on('click', 'button', removeFromQuest);
    $('#quest-locations-listing').on('click', '.add-location-button', addToQuestFromList);
    $('#add-group-to-quest').click(showGroupOptions);
    $('#cancel-group-to-quest').click(hideGroupOptions);
    $('#confirm-group-to-quest').click(confirmGroup);
    $('#clear-group-to-quest').click(clearGroupOptions);
  }
  function submitQuest() {
    $('.error-messages').empty();
    var questTitle = $('#quest-title').val().trim();
    var groups = $('#selected-groups').val();
    var locations = $('#location-ids').val();
    var description = $('#quest-description').val().trim();
    if (!questTitle) {
      noTitleAlert();
    }
    if (!locations) {
      noLocationsAlert();
    }
    if (!description) {
      noDescriptionAlert();
    }
    if (questTitle && locations && description) {
      $('form').submit();
    }
  }
  function noGroupsAlert() {
    var message = "<div class=\"error-message\">\n                   <p>Please add at least one group to your quest</p>\n                   </div>";
    $('.error-messages').append(message);
  }
  function noLocationsAlert() {
    var message = "<div class=\"error-message\">\n                   <p>Please add at least one location to your quest</p>\n                   </div>";
    $('.error-messages').append(message);
  }
  function noTitleAlert() {
    var message = "<div class=\"error-message\">\n                   <p>Please add a title to your quest</p>\n                   </div>";
    $('.error-messages').append(message);
  }
  function noDescriptionAlert() {
    var message = "<div class=\"error-message\">\n                   <p>Please add a description to your quest</p>\n                   </div>";
    $('.error-messages').append(message);
  }
  function fetchLocations() {
    $.ajax('/getAllLocations').done(function(data) {
      initMap();
      data.all.forEach((function(d) {
        placeMarkers(d.loc, d.name, d.description, d._id);
        buildLocationsListing(d);
      }));
      resizeMap();
    });
  }
  function buildLocationsListing(location) {
    var description = 'no description';
    if (location.description !== null) {
      description = (location.description.substr(0, 140) + "...");
    }
    var listing = ("<li class=\"location-listing\">\n                    <p class=\"name\">" + location.name + "</p>\n                    <p class=\"description\">" + description + "</p>\n                    <button class=\"add-location-button\", data-id=" + location._id + ">\n                      Add To List\n                    </button>\n                    <p class=\"location-in-quest\", hidden=true>In Quest</p>\n                  </li>");
    $('#quest-locations-listing').append(listing);
  }
  function filterLocations() {
    var filter = $('#map-filter').find('option:selected').text();
    switch (filter) {
      case 'All':
        $.ajax('/getAllLocations').done(function(data) {
          clearMap();
          data.all.forEach((function(d) {
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
      center: startLatLng
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
    var content = '<div class="pop-up-window"><h3 class="pop-up-title">' + siteName + '</h3>' + '<p class="pop-up-description">' + locDesc + '</p>' + '<a href="/locations/' + siteURL + '", class="info-window show-more">Show More</a>' + '<button class=add-to-quest data-id=' + locationId + '>Add To Quest</button>' + '<button class=remove-from-quest data-id=' + locationId + '>Remove From Quest</button></div>';
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
  function viewAddLocationsToQuest() {
    $('#view-quest-list').show();
    $('#quest-list').fadeOut(function() {
      $('.empty-quest-notification').remove();
      $('#create-quest-map').fadeIn();
    });
    $('#cancel-group-to-quest').hide();
    $('#confirm-group-to-quest').hide();
    $('#clear-group-to-quest').hide();
    $('.group-quest-options').hide();
    $('#view-current-quest').show();
    $('#add-location').hide();
  }
  function showQuestAndGroups() {
    if ($('#quest-locations-listing').css('display') === 'none') {
      $('#create-quest-map').fadeOut(function() {
        $('#quest-list').fadeIn();
      });
    } else {
      $('#quest-locations-listing').fadeOut(function() {
        $('#quest-list').fadeIn();
      });
    }
    $('#view-quest-list').hide();
    $('#quest-groups-list').fadeIn();
    $('#view-quest-map').hide();
    $('#view-current-quest').hide();
    $('#add-location').show();
    if ($('#quest-list ul li').length === 0) {
      $('#quest-list ul').append('<li class="empty-quest-notification">There are currently no locations added to this quest.</li>');
    } else {
      $('.empty-quest-notification').remove();
    }
  }
  var questLocations = [];
  function addToQuestFromList() {
    var locationId = $(this).data('id');
    var title = $(this).siblings('p:nth-child(1)').text();
    if (!isLocationInQuest(locationId)) {
      questLocations.push(locationId);
      addToQuestList(title, locationId);
      updateQuestForm();
      $(this).hide();
      swapInfoWindowButtons(true);
      updateAddToQuestList(locationId);
    }
  }
  function addToQuestFromMap() {
    var locationId = $(this).data('id');
    var title = $(this).siblings('h3').text();
    if (!isLocationInQuest(locationId)) {
      questLocations.push(locationId);
      addToQuestList(title, locationId);
      updateQuestForm();
      swapInfoWindowButtons(true);
      updateAddToQuestList(locationId);
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
    removeFromQuestList(id);
    updateQuestForm();
    if ($(this).hasClass('remove-from-quest') || $(this).hasClass('quest-listing')) {
      swapInfoWindowButtons(false);
      var listingButton = $('.location-listing').children(("button[data-id=" + id + "]"));
      listingButton.show();
      listingButton.siblings('.location-in-quest').hide();
    }
  }
  function removeFromQuestList(id) {
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
  function toggleMapAndList() {
    var button = $(this).attr('id');
    var list = $('#quest-locations-listing');
    var map = $('#create-quest-map');
    $(this).hide();
    if (button === 'view-quest-map') {
      list.fadeOut(function() {
        map.fadeIn();
      });
      $('#view-quest-list').show();
    } else if (button === 'view-quest-list') {
      map.fadeOut(function() {
        list.fadeIn();
      });
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
  function swapInfoWindowButtons(locationInQuest) {
    if (locationInQuest === true) {
      $('.add-to-quest').hide();
      $('.remove-from-quest').show();
    } else if (locationInQuest === false) {
      $('.remove-from-quest').hide();
      $('.add-to-quest').show();
    }
  }
  function updateAddToQuestList(locationId) {
    var locationListingButton = $('.location-listing').children(("button[data-id=" + locationId + "]"));
    var locationListingNotification = $('.location-listing').children(("button[data-id=" + locationId + "]")).siblings('.location-in-quest');
    if (isLocationInQuest(locationId)) {
      locationListingButton.hide();
      locationListingNotification.show().css('display', 'inline-block');
    } else {
      locationListingButton.show();
      locationListingNotification.hide();
    }
  }
  function addToQuestList(title, id) {
    var newLocation = $('<li>').text(title).attr('id', id);
    var button = $('<button class=quest-listing>').text('X').data('id', id);
    $(newLocation).append(button);
    $('#quest-list ul').append(newLocation);
  }
  function showGroupOptions(event) {
    event.preventDefault();
    $('input#location-ids').next('.border').remove();
    $('input#location-ids').after('<div class="border"></div>');
    $('#cancel-group-to-quest, #confirm-group-to-quest, .group-quest-options').show();
    $('#add-group-to-quest, #change-group-to-quest, #quest-groups-list, #clear-group-to-quest').hide();
  }
  function hideGroupOptions(event) {
    event.preventDefault();
    $('input#location-ids').next('.border').remove();
    $('.group-quest-options').hide();
    $('#cancel-group-to-quest, #confirm-group-to-quest').hide();
    $('#add-group-to-quest').show();
    $('.group-to-quest').each((function(i, input) {
      $(input).attr('checked', false);
    }));
  }
  function clearGroupOptions(event) {
    event.preventDefault();
    $('input#location-ids').next('.border').remove();
    $('#selected-groups').val('');
    $('#quest-groups-list').empty();
    $('#clear-group-to-quest').hide();
    $('#add-group-to-quest').show();
    $('.group-to-quest').each((function(i, input) {
      $(input).attr('checked', false);
    }));
  }
  function confirmGroup(event) {
    event.preventDefault();
    var groupIds = [];
    $('#quest-groups-list').empty();
    $('.group-to-quest:checked').each((function(i, input) {
      var groupId = $(input).attr('id');
      groupIds.push(groupId);
      var groupName = $(input).val();
      var listItem = ("<li>" + groupName + "</li>");
      $('#quest-groups-list').append(listItem);
    }));
    if (groupIds.length === 0) {
      $('input#location-ids').next('.border').remove();
      $('#clear-group-to-quest').hide();
    } else {
      $('#quest-groups-list').prepend('<li>Added Groups:</li>');
      $('#clear-group-to-quest').hide();
    }
    $('#selected-groups').val(groupIds);
    var selected = $('#selected-groups').val();
    showClearGroupOptions();
  }
  function showClearGroupOptions() {
    $('#quest-groups-list, #add-group-to-quest').show();
    $('#cancel-group-to-quest, #confirm-group-to-quest, .group-quest-options').hide();
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
