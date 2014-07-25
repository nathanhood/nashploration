/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Location = traceur.require(__dirname + '/../models/location.js');



exports.addHistory = (req, res)=>{
  // get historical markers
  Location.addHistory((bodyLength)=>{
    res.send('got ' + bodyLength + ' historical objects');
  });
};

exports.index = (req, res)=>{
  res.render('locations/index');
};


exports.getLocations = (req, res)=>{
  Location.findAll((locations)=>{
    res.send(locations);
  });
};

exports.getCivilWarLocations = (req, res)=>{
  Location.filterCivilWarLocations((locations)=>{
    res.send(locations);
  });
};

exports.getAndrewJacksonLocations = (req, res)=>{
  Location.filterAndrewJacksonLocations((locations)=>{
    res.send(locations);
  });
};


exports.locationDetails = (req, res)=>{
  Location.findCoordinates(req.params, location=>{
    res.render('locations/detail', {title: `${location.name}`, location: location});
  });
};

exports.findCloseLocs = (req, res)=>{
  Location.radialSearch(req.query, locations=>{
    console.log(locations);
    res.send(locations);
  });
};
