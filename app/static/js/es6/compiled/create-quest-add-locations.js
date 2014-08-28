(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
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
  function checkLocationInQuest() {
    var locationId = $('.add-to-quest').data('id');
    if (isLocationInQuest(locationId)) {
      $('.add-to-quest').hide();
    } else {
      $('.remove-from-quest').hide();
    }
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
