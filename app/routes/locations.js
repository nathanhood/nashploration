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


exports.getAllLocations = (req, res)=>{
  locationCollection.find().toArray(function(err, docs) {
    res.send(docs);
  });
};
