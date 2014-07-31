/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Location = traceur.require(__dirname + '/../models/quest.js');

exports.new = (req, res)=>{
  res.render('quests/createQuest', {title: 'Create Quest'});
};
