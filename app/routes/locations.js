/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Location = traceur.require(__dirname + '/../models/location.js');
var locationCollection = global.nss.db.collection('locations');


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
  // locationCollection.find().toArray(function(err, docs) {
  //   res.send(docs);
  // });
};
