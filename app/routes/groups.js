/* jshint unused:false */

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
      res.render('groups/view', {title: 'Nashploration', groups:groups, createdGroups:createdGroups, deleteGroupConfirm: req.flash('deleteGroupConfirm')});
    });
  });
};

exports.show = (req, res)=>{
  Group.findByGroupId(req.params.groupId, group=>{
    User.findManyById(group.members, members=>{
      res.render('groups/show', {title: 'Nashploration', group:group, members:members, joinGroupConfirm: req.flash('joinGroupConfirm')});
    });
  });
};

exports.edit = (req, res)=>{
  Group.findByGroupId(req.params.groupId, group=>{
    User.findManyById(group.members, members=>{
      res.render('groups/edit', {title: 'Nashploration', group:group, members:members, deleteGroupError: req.flash('deleteGroupError')});
    });
  });
};

exports.removeMember = (req, res)=>{
  Group.findByGroupId(req.body.groupId, group=>{
    var removed = group.removeMember(req.body.memberId);
    User.findById(removed[0], (err, user)=>{
      user.removeGroup(req.body.groupId);
      user.save(()=>{
        group.save(()=>{
          res.send(user);
        });
      });
    });
  });
};

exports.delete = (req, res)=>{
  var groupId = req.body.groupId;
  var groupName = req.body.groupName;
  User.removeGroupFromUsersGroups(groupId, (err)=>{
    User.removeGroupFromUserCreatedGroups(groupId, (err2)=>{
      Group.destroyGroup(groupId, (err3)=>{
        if (!err) {
          req.flash('deleteGroupConfirm', `${groupName} was successfully deleted`);
          res.redirect('/groups/view');
        } else {
          req.flash('deleteGroupError', 'There was a problem. Your group has not been deleted properly.');
          res.redirect(`/groups/edit/groupId`);
        }
      });
    });
  });
};

exports.updateName = (req, res)=>{
  Group.updateName(req.body.groupId, req.body.groupName, (err)=>{
    Group.findByGroupId(req.body.groupId, group=>{
      res.send(group);
    });
  });
};

exports.updateDescription = (req, res)=>{
  Group.updateDescription(req.body.groupId, req.body.groupDesc, (err)=>{
    Group.findByGroupId(req.body.groupId, group=>{
      res.send(group);
    });
  });
};

exports.joinGroup = (req, res)=>{
  var user = res.locals.user;
  Group.findByGroupCode(req.body.groupCode, group=>{
    if (!group) {
      req.flash('invalideGroupCode', 'The group code you entered is not valid.');
      res.redirect(`/users/${user.userName}`);
    } else {
      var exists = group.isInGroup(user);
        if (exists) {
          req.flash('groupMemberExists', `You are already a member of group ${group.name}`);
          res.redirect(`/users/${user.userName}`);
        } else {
          group.joinGroup(user);
          user.save(()=>{
            group.save(()=>{
              req.flash('joinGroupConfirm', 'You have successfully joined this group!');
              res.redirect(`/groups/show/${group._id}`);
            });
          });
        }
    }
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
