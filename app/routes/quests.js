/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Quest = traceur.require(__dirname + '/../models/quest.js');

exports.new = (req, res)=>{
  res.render('quests/createQuest', {title: 'Create Quest'});
};

exports.create = (req, res)=>{
  var locations = req.body.locations;
  
};
