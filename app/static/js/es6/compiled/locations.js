(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    findWindowSize();
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('body').on('click', '.info-window', showStreetView);
    fadeConfirmMessage();
    $('.checkin-button').click(submitCheckInListForm);
  }
  var defaultMarker;
  var checkInMarker;
  var questIcon;
  function findWindowSize() {
    var height = $(window).height();
    var width = $(window).width();
    sizeMarkers(height, width);
  }
  function sizeMarkers(h, w) {
    var width = 80;
    var height = 40;
    if (w < 321) {
      height = 30;
      width = 21;
    }
    defaultMarker = {
      url: 'img/assets/pins/pin-orange.svg',
      scaledSize: new google.maps.Size(width, height)
    };
    checkInMarker = {
      url: '/img/assets/pins/pin-blue.svg',
      scaledSize: new google.maps.Size(width, height)
    };
    questIcon = {
      url: '/img/assets/pins/pin-blue-orange.svg',
      scaledSize: new google.maps.Size(width, height)
    };
  }
  function submitCheckInListForm(event) {
    $('form.checkin-form').submit();
    event.preventDefault();
  }
  var allMarkers = [];
  function fetchLocations() {
    $.ajax('/getFilteredLocations').done(function(data) {
      initMap();
      if (data.quest) {
        data.quest.forEach((function(q) {
          placeQuestMarkers(q.loc, q.name, q.description);
        }));
      }
      if (data.checkIns) {
        data.checkIns.forEach((function(c) {
          placeCheckInMarkers(c.loc, c.name, c.description);
        }));
      }
      data.all.forEach((function(a) {
        placeMarkers(a.loc, a.name, a.description);
      }));
      resizeMap();
    });
  }
  function removeAllDups(data) {
    for (var i = 0; i < data.length; i++) {
      var found = false,
          num = data[$traceurRuntime.toProperty(i)].number;
      for (var j = i + 1; j < data.length; j++) {
        if (data[$traceurRuntime.toProperty(j)].number === num) {
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
  function filterLocations() {
    var filter = $('#map-filter').find('option:selected').text();
    switch (filter) {
      case 'All':
        fetchLocations();
        break;
      case 'Civil War Sites':
        $.ajax('/getCivilWarLocations').done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description);
          }));
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        $.ajax('/getAndrewJacksonLocations').done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description);
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
    for (var j = 0; j < questMarkers.length; j++) {
      questMarkers[$traceurRuntime.toProperty(j)].setMap(map);
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
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
      checkCloseLocs(event.latLng);
    });
  }
  var markers = [];
  var coordinates = [];
  function placeMarkers(coords, locName, locDesc) {
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);
    latLng = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: defaultMarker
    });
    markers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc);
  }
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
  var questMarkers = [];
  function placeQuestMarkers(coords, locName, locDesc) {
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
    var content = '<div class="pop-up-window"><h3 class="pop-up-title">' + siteName + '</h3>' + '<p class="pop-up-description">' + locDesc + '</p>' + '<a href="/locations/' + siteURL + '", class="info-window pop-up-link">Show More</a></div>';
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
  var currentLat;
  var currentLong;
  function checkCloseLocs(pos) {
    currentLat = pos.k;
    currentLong = pos.B;
    if (closeMarkers.length) {
      resetMarkers();
    }
    $.ajax(("/getCloseLocs/" + currentLat + "/" + currentLong)).done(function(data) {
      var nearbyIds = [];
      data.forEach((function(i) {
        nearbyIds.push(i._id);
        addCheckInMarkers(i.loc);
        addCheckInButton(i.name, i.description, i._id);
      }));
      $('.checkin-form input').val(nearbyIds);
    });
  }
  var closeMarkers = [];
  function addCheckInMarkers(coords) {
    allMarkers.forEach((function(m) {
      if (m.position.k.toFixed(6) === coords[1].toFixed(6) && m.position.B.toFixed(6) === coords[0].toFixed(6)) {
        toggleBounce(m);
        closeMarkers.push(m);
      }
    }));
  }
  var closeLocations = [];
  function addCheckInButton(windowName, description, id) {
    allInfoWindows.forEach((function(w) {
      var siteURL = windowName.toLowerCase().split(' ').join('-');
      if (description === null) {
        description = 'There is no description for this site.';
      }
      if (w.content.match(windowName)) {
        var content = '<div class="pop-up">' + '<h3 class="pop-up-title">' + windowName + '</h3>' + '<p class="pop-up-p">' + description + '</p>' + '<a href="/locations/' + siteURL + '", class="info-window pop-up-link">Show More</a>' + '<a href="/checkIn/' + id + '", class="checkin-button"> <button>Check In</button></a>' + '</div>';
        w.setContent(content);
      }
    }));
    closeLocations.push(windowName);
  }
  function toggleBounce(m) {
    m.setAnimation(google.maps.Animation.BOUNCE);
    google.maps.event.addListener(m, 'click', function() {
      m.setAnimation(null);
    });
  }
  function resetMarkers() {
    closeMarkers.forEach((function(i) {
      i.setAnimation(null);
    }));
    closeMarkers = [];
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
  function fadeConfirmMessage() {
    setTimeout(function() {
      $('.messages').fadeOut('slow');
    }, 4000);
  }
})();
