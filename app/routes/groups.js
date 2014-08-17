'use strict';

var traceur = require('traceur');
var Group = traceur.require(__dirname + '/../models/group.js');


exports.new = (req, res)=>{
  var code = Group.groupCode();
  res.render('groups/create-group.jade', {title: 'Nashploration', groupCode:code});
};

exports.create = (req, res)=>{
  var user = res.locals.user;
  var group = new Group(user._id, req.body);
  Group.inviteGroupMembers(req.body, user, ()=>{
    group.save(()=>{
      // confirmation that emails have been sent and group created. Include group Code
      res.redirect(`/users/${user.userName}`);
    });
  });
};
