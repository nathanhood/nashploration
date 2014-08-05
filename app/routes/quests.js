/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');
var Location = traceur.require(__dirname + '/../models/location.js');

exports.new = (req, res)=>{
  var userId = res.locals.user._id;
  Group.findAllByOwnerId(userId, groups=>{
    res.render('quests/create-quest', {title: 'Create Quest', groups:groups});
  });
};

exports.create = (req, res)=>{
  var userId = res.locals.user._id;
  var groupUsers = null;
  var groupIds = null;
  Group.findManyById(req.body.groupIds, groups=>{
    if (groups !== null) {
      groupUsers = Group.accumulateUsersFromGroups(groups);
      groupIds = Group.accumulateGroupIds(groups);
    }
    Location.findManyById(req.body.locations, locations=>{
      Location.accumulateLocationIds(locations, locationIds=>{
        var quest = new Quest(userId, locationIds, req.body.name, groupUsers, groupIds);
        quest.save(()=>{
          res.redirect('/dashboard');
        });
      });
    });
  });
};

exports.questMap = (req, res)=>{
  res.render('quests/quest-map');
};
