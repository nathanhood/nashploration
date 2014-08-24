/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');

exports.new = (req, res)=>{
  var userId = res.locals.user._id;
  Group.findAllByOwnerId(userId, groups=>{
    res.render('quests/create-quest', {title: 'Nashploration', groups:groups});
  });
};

exports.create = (req, res)=>{
  var userId = res.locals.user._id;
  var groupUsers = null;
  var groupIds = null;
  var user = res.locals.user;
  Group.findManyById(req.body.groupIds, groups=>{
    if (groups !== null) {
      groupUsers = Group.accumulateUsersFromGroups(groups);
      groupIds = Group.accumulateGroupIds(groups);
    }
    Location.findManyById(req.body.locations, locations=>{
      Location.accumulateLocationIds(locations, locationIds=>{
        var quest = new Quest(userId, locationIds, req.body, groupUsers, groupIds);
        quest.save(()=>{
          user.createdQuests.push(quest._id);
          user.save(()=>{
            req.flash('questConfirm', 'Quest successfully created!');
            res.redirect(`/users/${res.locals.user.userName}`);
          });
        });
      });
    });
  });
};

exports.view = (req, res)=>{
  var myQuests = res.locals.user.myQuests;
  var completedQuests = res.locals.user.completedQuests;
  Quest.findByUserId(res.locals.user._id, created=>{
    Quest.findManyById(myQuests, allMyQuests=>{
      Quest.findManyById(completedQuests, complete=>{
        User.findAndReplaceQuestCreators(created, finalCreated=>{
          User.findAndReplaceQuestCreators(allMyQuests, finalMyQuests=>{
            User.findAndReplaceQuestCreators(complete, finalComplete=>{
              res.render('quests/view', {title: 'Nashploration', createdQuests:finalCreated , myQuests:finalMyQuests,
              completedQuests: finalComplete, questRemovedFromMyQuests: req.flash('questRemovedFromMyQuests')});
            });
          });
        });
      });
    });
  });
};

exports.show = (req, res)=>{
  Quest.findById(req.params.questId, (err, quest)=>{
    User.findById(quest.creator, (err, user)=>{
      res.render('quests/show', {title: 'Nashploration', user:user, quest:quest});
    });
  });
};

exports.edit = (req, res)=>{
  Quest.findById(req.params.questId, (err, quest)=>{
    res.render('quests/edit', {title: 'Nashploration', quest:quest});
  });
};

exports.questMap = (req, res)=>{
  res.render('quests/quest-map');
};
