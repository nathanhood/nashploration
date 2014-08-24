'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');
var Quest = traceur.require(__dirname + '/../models/quest.js');

exports.getResults = (req, res)=>{
  var results = {};
  Location.searchByNameAndDesc(req.query.search, locations=>{
    Quest.searchByName(req.query.search, questResults=>{
      User.searchByName(req.query.search, userResults=>{
        results.questNames = questResults;
        results.locations= locations;
        results.userNames = userResults;
        res.render('search/results', {title: 'Nashploration', results: results});
      });
    });
  });
};
