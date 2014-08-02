/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');
var Mongo = require('mongodb');

exports.new = (req, res)=>{
  var userId = Mongo.ObjectID(req.session.userId);
  Group.findAllByOwnerId(userId, groups=>{
    res.render('quests/createQuest', {title: 'Create Quest', groups:groups});
  });
};

exports.create = (req, res)=>{
  var locations = req.body.locations;
};
