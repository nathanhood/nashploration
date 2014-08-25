/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');

var multiparty = require('multiparty');

exports.new = (req, res)=>{
  var userId = res.locals.user._id;
  Group.findAllByOwnerId(userId, groups=>{
    res.render('quests/create-quest', {title: 'Nashploration', groups:groups});
  });
};

exports.create = (req, res)=>{
  var userId = res.locals.user._id;
  var user = res.locals.user;
  var groupUsers = null;
  var groupIds = null;

  var form = new multiparty.Form();
  form.parse(req, (err, fields, files)=>{

    Group.findManyById(fields.groupIds[0], groups=>{
      if (groups !== null) {
        groupUsers = Group.accumulateUsersFromGroups(groups);
        groupIds = Group.accumulateGroupIds(groups);
      }
      Location.findManyById(fields.locations[0], locations=>{
        Location.accumulateLocationIds(locations, locationIds=>{
          var quest = new Quest(userId, locationIds, fields, groupUsers, groupIds);
          quest.save(()=>{
            quest.photo = quest.processPhoto(files.photo[0]);
            quest.save(()=>{
              user.createdQuests.push(quest._id);
              user.save(()=>{
                User.updateQuestOnManyUsers(groupUsers, quest._id, (err, result)=>{
                  req.flash('questConfirm', 'Quest successfully created!');
                  res.redirect(`/users/${res.locals.user.userName}`);
                });
              });
            });
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
              completedQuests: finalComplete, questRemovedFromMyQuests: req.flash('questRemovedFromMyQuests'),
              questUpdateConfirm: req.flash('questUpdateConfirm')});
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
  var userId = res.locals.user._id;
  Quest.findById(req.params.questId, (err, quest)=>{
    Group.findAllByOwnerId(userId, groups=>{
      var finalGroups = quest.findUnAddedGroupIds(groups);
      res.render('quests/edit', {title: 'Nashploration', quest:quest, groups:finalGroups});
    });
  });
};

exports.updateQuest = (req, res)=>{
  var questId = req.params.questId;
  var groupUsers = null;
  var groupIds = null;

  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    Quest.findById(questId, (err, quest)=>{
      Group.findManyById(fields.groupIds[0], groups=>{
        if (groups !== null) {
          groupUsers = Group.accumulateUsersFromGroups(groups);
          groupIds = Group.accumulateGroupIds(groups);
          quest.addGroupUsers(groupUsers);
          quest.addGroupIds(groupIds);
        }
        quest.photo = quest.processPhoto(files.photo[0]);
        quest.save(()=>{
          User.findManyById(groupUsers, users=>{

            groupUsers = User.findUsersWithoutQuest(users, groupUsers, quest._id);
            User.updateQuestOnManyUsers(groupUsers, quest._id, (err, result)=>{
              req.flash('questUpdateConfirm', `${quest.name} was successfully updated!`);
              res.redirect('/quests/view');
            });
          });
        });
      });
    });
  });
};

exports.questMap = (req, res)=>{
  res.render('quests/quest-map');
};
