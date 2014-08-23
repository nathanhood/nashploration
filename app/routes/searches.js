'use strict';

var traceur = require('traceur');
// var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');
// var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');

exports.getResults = (req, res)=>{
  // var searchResults = [];

  Location.searchByName(req.query.search, locationNameResults=>{
    Location.searchByDescription(req.query.search, locationDescResults=>{
      Group.searchByName(req.query.search, groupResults=>{
        console.log('IN SEARCH ROUTE=========');
        console.log('location name');
        console.log(locationNameResults);
        console.log('loc descp');
        console.log(locationDescResults);
        console.log('groupResults');
        console.log(groupResults);
      });
    });
  });
};
