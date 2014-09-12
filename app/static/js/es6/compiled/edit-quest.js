(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    fetchLocations();
    $('.remove-quest').click(removeQuest);
    $('.submit-quest-changes').click(submitForm);
  }
  function submitForm(event) {
    var groups = [];
    $('.group-to-quest:checked').each((function(i, group) {
      groups.push($(group).attr('id'));
    }));
    $('#selected-groups').val(groups);
    $('form').submit();
    event.preventDefault();
  }
  function removeQuest(event) {
    var questId = $('.quest-name').data('id');
    var r = confirm('Are you sure you want to remove this quest?\nAll progress will be lost.');
    if (r === true) {
      $('.remove-quest-form').submit();
    }
    event.preventDefault();
  }
  function fetchLocations() {
    var questId = $('.quest-name').data('id');
    $.ajax(("/getQuestLocations/" + questId)).done(function(data) {
      initMap();
      if (data.incomplete.length > 0) {
        createQuestList(data.incomplete);
        data.incomplete.forEach((function(a) {
          placeMarkers(a.loc, a.name, a.description);
        }));
      }
      if (data.complete) {
        data.complete.forEach((function(a) {
          placeCheckInMarkers(a.loc, a.name, a.description);
        }));
      }
      resizeMap();
    });
  }
  var allMarkers = [];
  function createQuestList(questLocations) {
    questLocations.forEach((function(location) {
      var destination = ("<li class='quest-destination'>\n                          <h3>" + location.name + "</h3>\n                          <p class=\"label\">Address:</p>\n                          <p class=\"quest-address\">" + location.address + "<p>\n                          <p class=\"label\">Details:</p>\n                          <p class=\"quest-details\">" + location.description + "</p>\n                        </li>");
      $('.quest-destinations').append(destination);
    }));
  }
  var map;
  function initMap() {
    var startLatLng = new google.maps.LatLng(36.1667, -86.7833);
    var mapOptions = {
      zoom: 14,
      center: startLatLng
    };
    map = new google.maps.Map(document.getElementById('quest-map-canvas'), mapOptions);
  }
  var markers = [];
  var coordinates = [];
  function placeMarkers(coords, locName, locDesc) {
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);
    latLng = new google.maps.Marker({
      position: latLng,
      map: map
    });
    markers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc);
  }
  var checkInMarker = {
    url: '/img/checkin-pin.svg',
    scaledSize: new google.maps.Size(40, 40)
  };
  var checkInMarkers = [];
  function placeCheckInMarkers(coords, locName, locDesc) {
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);
    latLng = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: checkInMarker
    });
    checkInMarkers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc);
  }
  function resizeMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < coordinates.length; i++) {
      latlngbounds.extend(coordinates[$traceurRuntime.toProperty(i)]);
    }
    map.fitBounds(latlngbounds);
  }
  var allInfoWindows = [];
  function infoWindows(siteName, windowLoc, locDesc) {
    var siteURL = siteName.toLowerCase().split(' ').join('-');
    if (locDesc === null) {
      locDesc = 'There is no description for this site.';
    }
    var content = '<h3>' + siteName + '</h3>' + '<p>' + locDesc + '</p>' + '<a href="/locations/' + siteURL + '", class="info-window">Show More</a>';
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
  function showStreetView() {
    var lat = $(this).attr('data-lat');
    var long = $(this).attr('data-long');
    var streetLatLng = new google.maps.LatLng(lat, long);
    var panoOptions = {
      position: streetLatLng,
      addressControlOptions: {position: google.maps.ControlPosition.BOTTOM_CENTER},
      linksControl: false,
      panControl: false,
      zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL},
      enableCloseButton: false
    };
    var streetView = new google.maps.StreetViewPanorama(document.getElementById('street-view'), panoOptions);
  }
  var currLocMarker = {
    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
    strokeColor: 'darkgreen',
    scale: 5
  };
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
