(function() {
  'use strict';
  $(document).ready(init);
  function init() {
    sizeMarkers();
    fetchLocations();
    $('#map-filter select').on('change', filterLocations);
    $('body').on('click', '.info-window', showStreetView);
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
      scaledSize: new google.maps.Size(width, height),
      flatten: true,
      optimized: true
    };
    checkInMarker = {
      url: '/img/assets/pins/pin-blue.png',
      scaledSize: new google.maps.Size(width, height),
      optimized: true
    };
    questIcon = {
      url: '/img/assets/pins/pin-blue-orange.png',
      scaledSize: new google.maps.Size(width, height),
      optimized: true
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
          placeQuestMarkers(q.loc, q.name, q.description, q._id);
        }));
      }
      data.all.forEach((function(a) {
        placeMarkers(a.loc, a.name, a.description, a._id);
      }));
      if (data.checkIns) {
        data.checkIns.forEach((function(c) {
          placeCheckInMarkers(c.loc, c.name, c.description, c._id);
        }));
      }
      map.setZoom(13);
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
    var params;
    switch (filter) {
      case 'All':
        fetchLocations();
        break;
      case 'Civil War Sites':
        params = 'Civil War Sites';
        $.ajax('/getFilteredLocations/' + params).done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Andrew Jackson':
        params = 'Andrew Jackson';
        $.ajax('/getFilteredLocations/' + params).done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Schools':
        params = 'School';
        $.ajax('/getFilteredLocations/' + params).done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Cemeteries':
        params = 'Cemetery';
        $.ajax('/getFilteredLocations/' + params).done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Churches':
        params = 'Church';
        $.ajax('/getFilteredLocations/' + params).done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeMarkers(d.loc, d.name, d.description, d._id);
          }));
          resizeMap();
        });
        break;
      case 'Active Quest':
        $.ajax('/getActiveQuestLocations').done(function(data) {
          clearMap();
          data.forEach((function(d) {
            placeQuestMarkers(d.loc, d.name, d.description, d._id);
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
    for (var l = 0; l < checkInMarkers.length; l++) {
      checkInMarkers[$traceurRuntime.toProperty(l)].setMap(map);
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
      setMapGeo(false);
    });
    google.maps.event.addListener(map, 'dragend', function(event) {
      setMapGeo(false);
    });
    $('#geolocation-control').click(setMapGeo);
  }
  var markers = [];
  var coordinates = [];
  function placeMarkers(coords, locName, locDesc, id) {
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);
    latLng = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: defaultMarker
    });
    markers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc, id);
  }
  var checkInMarkers = [];
  function placeCheckInMarkers(coords, locName, locDesc, id) {
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    coordinates.push(latLng);
    latLng = new google.maps.Marker({
      position: latLng,
      map: map,
      icon: checkInMarker
    });
    checkInMarkers.push(latLng);
    allMarkers.push(latLng);
    infoWindows(locName, latLng, locDesc, id);
  }
  var questMarkers = [];
  function placeQuestMarkers(coords, locName, locDesc, id) {
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
  function resizeMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < coordinates.length; i++) {
      latlngbounds.extend(coordinates[$traceurRuntime.toProperty(i)]);
    }
    map.fitBounds(latlngbounds);
  }
  var allInfoWindows = [];
  function infoWindows(siteName, windowLoc, locDesc, id) {
    if (locDesc === null) {
      locDesc = 'There is no description for this site.';
    }
    var content = '<div class="pop-up-window"><h3 class="pop-up-title">' + siteName + '</h3>' + '<p class="pop-up-description">' + locDesc + '</p>' + '<a href="/locations/show/' + id + '", class="info-window pop-up-link">Show More</a></div>';
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
  var timer;
  function setMapGeo(geoBool) {
    if ((typeof geoBool === 'undefined' ? 'undefined' : $traceurRuntime.typeof(geoBool)) === 'object') {
      findLocation();
      timer = setInterval(function() {
        findLocation();
      }, 5000);
    } else {
      clearInterval(timer);
    }
  }
  var pos;
  var userLocMarker;
  function findLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if (userLocMarker) {
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
      position: new google.maps.LatLng(36.1667, -86.7833),
      content: content
    };
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }
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
        var content = '<div class="pop-up">' + '<h3 class="pop-up-title">' + windowName + '</h3>' + '<p class="pop-up-p">' + description + '</p>' + '<a href="/locations/' + siteURL + '", class="info-window pop-up-link">Show More</a>' + '<a href="/checkIn/' + id + '", class="checkin-button pop-up-link">Check In</a>' + '</div>';
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
      $('.home-messages').fadeOut('slow');
    }, 4000);
  }
  function showNotification() {
    $('.notification-wrapper').fadeToggle();
  }
  function hideNotification() {
    $('.notification-wrapper').fadeOut();
  }
})();
