/* jshint unused:false, camelcase:false */

'use strict';
var needle = require('needle');
var traceur = require('traceur');
var Location = traceur.require(__dirname + '/../models/location.js');
var locationCollection = global.nss.db.collection('locations');

function dummy() {}

exports.addHistory = (req, res)=>{
  // get historical markers
  needle.get('http://data.nashville.gov/resource/vk65-u7my.json', function(error, response, body) {
    var markers = body;
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].mapped_location) {
        var newLocation = {
            name: markers[i].title,
            address: markers[i].location,
            gis: [markers[i].mapped_location.latitude,markers[i].mapped_location.longitude],
            description: markers[i].marker_text, //.replace(/s{2,}/g,' '),
            class: 'history'};
        // save to db
        locationCollection.save(newLocation, dummy);
      }
    }
    res.send('got ' + body.length + ' historical objects');
  });
};

exports.addArt = (req, res)=>{
  // get art markers
  needle.get('http://data.nashville.gov/resource/dqkw-tj5j.json', function(error, response, body) {
    var markers = body;
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].mapped_location) {
        var description = markers[i].type;
        if (markers[i].description) {
          description += ' ' + markers[i].description.replace(/s{2,}/g,' ');
        }
        var newLocation = {
            name: markers[i].title,
            address: markers[i].location,
            gis: [markers[i].mapped_location.latitude,markers[i].mapped_location.longitude],
            description: description,
            class: 'art'};
        locationCollection.save(newLocation, dummy);
      }
    }
    res.send('added ' + body.length + ' art objects');
  });
};

exports.addPark = (req, res)=>{
  // get art markers
  needle.get('http://data.nashville.gov/resource/74d7-b74t.json', function(error, response, body) {
    var markers = body;

    for (var i = 0; i < markers.length; i++) {
      if (markers[i].mapped_location) {
        var newLocation = {
            name: markers[i].park_name,
            address: markers[i].mapped_location.human_address.address,
            gis: [markers[i].mapped_location.latitude,markers[i].mapped_location.longitude],
            description: markers[i].notes,
            class: 'park'};
        locationCollection.save(newLocation, dummy);
      }
    }
    res.send('added ' + body.length + ' park objects');
  });
};


exports.getAllLocations = (req, res)=>{
  locationCollection.find().toArray(function(err, docs) {
    res.send(docs);
  });
};
