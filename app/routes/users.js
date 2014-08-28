/* jshint unused: false */
'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');

var multiparty = require('multiparty');
var async = require('async');


exports.index = (req, res)=>{
  res.render('users/index', {title: 'Nashploration', successCheckIn: req.flash('checkInSuccess')});
};

exports.profile = (req, res)=>{
  User.findByUserName(req.params.userName, user=>{
    if (user) {
        res.render('users/profile', {title: 'Nashploration', profileOwner: user,
        unknownProfile: req.flash('unknownProfile'),
        groupConfirmation: req.flash('groupConfirmation'),
        joinedGroup: req.flash('joinedGroup'),
        questConfirm: req.flash('questConfirm'),
        invalideGroupCode: req.flash('invalideGroupCode'),
        groupMemberExists: req.flash('groupMemberExists'),
        addedToMyQuests: req.flash('addedToMyQuests'),
        alreadyInMyQuests: req.flash('alreadyInMyQuests')
        });

    } else {
      req.flash('unknownProfile', `There is no one with the username ${req.params.userName}.`);
      res.redirect(`/users/${res.locals.user.userName}`);
    }
  });
};

exports.register = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{

    var photoObj = files.photo[0];
    var userName = fields.userName[0].split(' ').map(w=>w.trim()).map(w=>w.toLowerCase()).join('');
    Group.findByGroupCode(fields.groupCode[0], group=>{
      User.register(fields, userName, (u)=>{
        if (u) {
          u.photo = u.processPhoto(photoObj);
          if (!group) {
            u.save(()=>{
              res.locals.user = u;
              req.session.userId = u._id;
              res.redirect(`/users/${u.userName}`);
            });
          } else {
            group.joinGroup(u);
            Quest.findManyById(group.quests, (quests)=>{
              quests.forEach((quest, i)=>{ Quest.addGroupUser(quests[i], u._id); });
              async.map(quests, Quest.updateGroupUsers, ()=>{
                u.save(()=>{
                  group.save(()=>{
                    res.locals.user = u;
                    req.session.userId = u._id;
                    req.flash('joinedGroup', `You successfully joined the group ${group.name}`);
                    res.redirect(`/users/${u.userName}`);
                  });
                });
              });
            });
          }
        } else {
          req.flash('registerAndLogin', 'That username and/or email already exists. Please try again.');
          res.redirect('/');
        }
      });
    });
  });
};

exports.login = (req, res)=>{
  if (req.body.groupCode) {
    var groupCode = req.body.groupCode;
    Group.findByGroupCode(groupCode, group=>{
      User.login(req.body, u=>{
        if (u) {
          group.joinGroup(u);
          Quest.findManyById(group.quests, (quests)=>{
            quests.forEach((quest, i)=>{ Quest.addGroupUser(quests[i], u._id); });
            async.map(quests, Quest.updateGroupUsers, ()=>{
              u.save(()=>{
                group.save(()=>{
                  res.locals.user = u;
                  req.session.userId = u._id;
                  req.flash('joinedGroup', `You successfully joined the group ${group.name}`);
                  res.redirect(`/users/${u.userName}`);
                });
              });
            });
          });
        } else {
          req.flash('registerAndLogin', 'No account exists with those credentials');
          res.redirect('/');
        }
      });
    });
  } else {
    User.login(req.body, u=>{
      if (u) {
        res.locals.user = u;
        req.session.userId = u._id;
        res.redirect('/dashboard');
      } else {
        req.flash('registerAndLogin', 'No account exists with those credentials');
        res.redirect('/');
      }
    });
  }
};

exports.lookup = (req, res, next)=>{
  User.findById(req.session.userId, (err, u)=>{
    res.locals.user = u;
    next();
  });
};

exports.bounce = (req, res, next)=>{
  if (res.locals.user) {
    return next();
  } else {
    res.redirect('/');
  }
};

exports.logout = (req, res)=>{
  req.session.userId = null;
  res.redirect('/');
};

exports.viewNearbyCheckIns = (req, res)=>{
  Location.findManyById(req.query.nearbyCheckIns, locations=>{
    res.render('users/checkIn-list', {title: 'Nashploration', locations:locations});
  });
};

exports.showCheckIn = (req, res)=>{
  res.locals.user.isPreviousCheckIn(req.params.locationId, prevCheckInStatus=>{ //checks if location has already been checked into..used to alert user that multiple checkins to same location do not count
    Location.findById(req.params.locationId, (err, location)=>{
      res.render('users/checkIn', {title: 'Nashploration', location: location, prevCheckInStatus: prevCheckInStatus});
    });
  });
};

exports.checkIn = (req, res)=>{
  var currLoc = {lat: req.query.lat, lng: req.query.lng};
  var user = res.locals.user;
  Location.findById(req.params.locationId, (err, location)=>{
    location.saveComment(req.body.comment, currLoc, res.locals.user._id, ()=>{
      Quest.findById(user.activeQuest.questId, (err,quest)=>{
        var isCompleted = false;
        if (quest) {
          user.updateActiveQuest(quest.checkIns, location._id);
          isCompleted = user.isActiveQuestComplete(quest);
          if (isCompleted) {
            user.addCompletedQuest();
          }
        }
        user.updateCheckIns(location._id);
        Quest.findManyById(user.completedQuests, quests=>{
          user.calculateUserScore(quests);
          var upgradedClass = user.updateBadgeAndClass();
          user.save(()=>{
            location.save(()=>{
            if (isCompleted && upgradedClass) {
              res.redirect('/quests/class-quest-confirmation');
            } else if (isCompleted && !upgradedClass) {
              res.redirect('/quests/quest-confirmation');
            } else if (upgradedClass && !isCompleted) {
              res.redirect('/quests/class-confirmation');
            } else {
              req.flash('checkInSuccess', `You successfully checked into ${location.name}!`);
              res.redirect('/dashboard');
            }
            });
          });
        });
      });
    });
  });
};

exports.getActiveQuestLocations = (req, res)=>{
  Quest.findById(res.locals.user.activeQuest.questId, (err, quest)=>{
    if(quest.checkIns.length === res.locals.user.activeQuest.questLocs.length){
      res.send(null);
    }else{
    Location.findActiveQuestLocations(quest.checkIns, res.locals.user.activeQuest.questLocs, (locations)=>{
      res.send(locations);
    });
   }
  });
};

exports.addActiveQuest = (req, res)=>{
  var user = res.locals.user;
  user.addQuest(req.params.questId);
  user.makeActiveQuest(req.params.questId);
  user.save(()=>{
    res.redirect('/dashboard');
  });
};

exports.addQuest = (req, res)=>{
  var user = res.locals.user;
  var addedToMyQuests = user.addQuest(req.params.questId);
  if (addedToMyQuests) {
    user.save(()=>{
      req.flash('addedToMyQuests', 'Quest successfully added to your account!');
      res.redirect(`/users/${user.userName}`);
    });
  } else {
    req.flash('alreadyInMyQuests', 'You have already added that quest to your account');
    res.redirect(`/users/${user.userName}`);
  }
};

exports.removeQuest = (req, res)=>{
  var user = res.locals.user;
  user.removeQuest(req.params.questId);
  user.save(()=>{
    Quest.findById(req.params.questId, (err, quest)=>{
      req.flash('questRemovedFromMyQuests', `${quest.name} has been successfully removed`);
      res.redirect('/quests/view');
    });
  });
};

exports.fetchInfo = (req, res)=>{
  res.render('users/edit', {title: 'Nashploration', profileOwner: res.locals.user});
};

exports.updateInfo = (req, res)=>{
  res.locals.user.updateInfo(req.body, updatedUser=>{
    res.redirect(`/users/edit/${updatedUser._id}`);
  });
};

exports.changePhoto = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    res.locals.user.photo = res.locals.user.processPhoto(files.photo[0]);
    res.locals.user.save(()=>{
      res.redirect(`/users/edit/${res.locals.user._id}`);
    });
  });
};

exports.leaderBoard = (req, res)=>{
  var user = res.locals.user;
  User.findLeaders(leaders=>{
    Group.findManyById(user.groups, groups=>{
      res.render('users/leaders', {title: 'Nashploration', leaders:leaders, groups:groups});
    });
  });
};

exports.fetchCheckins = (req, res)=>{
  User.findByUserName(req.params.userName, user=>{
    user.findCheckins((checkInsWithTime, locIdsArray)=>{
      Location.findManyById(locIdsArray, locations=>{
        Location.matchCheckInWithLoc(checkInsWithTime, locations, locationsWithTime=>{
          res.render('users/checkIns', {title: 'Nashploration', checkIns: locationsWithTime});
        });
      });
    });
  });
};
