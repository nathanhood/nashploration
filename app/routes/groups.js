'use strict';

var traceur = require('traceur');
var Group = traceur.require(__dirname + '/../models/group.js');
var User = traceur.require(__dirname + '/../models/user.js');


exports.new = (req, res)=>{
  var code = Group.groupCode();
  res.render('groups/create-group.jade', {title: 'Nashploration', groupCode:code});
};

exports.create = (req, res)=>{
  var user = res.locals.user;
  var group = new Group(user._id, req.body);
  Group.inviteGroupMembers(req.body, user, ()=>{
    group.save(()=>{
      user.createdGroups.push(group._id);
      user.save(()=>{
        req.flash('groupConfirmation', `Group ${group.name} has been created and your invitations have been sent!`);
        res.redirect(`/users/${user.userName}`);
      });
    });
  });
};

exports.view = (req, res)=>{
  var myGroups = res.locals.user.groups;
  Group.findManyById(myGroups, groups=>{
    Group.findAllByOwnerId(res.locals.user._id, createdGroups=>{
      res.render('groups/view', {title: 'Nashploration', groups:groups, createdGroups:createdGroups});
    });
  });
};

exports.show = (req, res)=>{
  Group.findByGroupId(req.params.groupId, group=>{
    User.findManyById(group.members, members=>{
      res.render('groups/show', {title: 'Nashploration', group:group, members:members});
    });
  });
};

exports.sendInvitation = (req, res)=>{
  var user = res.locals.user;
  Group.findByGroupId(req.body.groupId, group=>{
    Group.sendGroupInvitation(req.body, user, group, ()=>{
      res.send(req.body.name);
    });
  });
};
