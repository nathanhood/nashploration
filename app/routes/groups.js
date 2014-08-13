'use strict';

var traceur = require('traceur');
var Group = traceur.require(__dirname + '/../models/group.js');


exports.new = (req, res)=>{
  var code = Group.groupCode();
  res.render('groups/create-group.jade', {title: 'Nashploration', groupCode:code});
};
