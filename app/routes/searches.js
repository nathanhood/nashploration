'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');

exports.getResults = (req, res)=>{
  var results = {};
  Location.searchByName(req.query.search, locationNameResults=>{
    Location.searchByDescription(req.query.search, locationDescResults=>{
      Group.searchByName(req.query.search, groupResults=>{
        Quest.searchByName(req.query.search, questResults=>{
          User.searchByName(req.query.search, userResults=>{
            results.questNames = questResults;
            results.groupNames = groupResults;
            results.locationNames = locationNameResults;
            results.locationDescResults = locationDescResults;
            results.userNames = userResults;
            res.render('search/results', {title: 'Nashploration', results: results});
          });
        });
      });
    });
  });
};
