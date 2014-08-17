'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');
var Quest = traceur.require(__dirname + '/../models/quest.js');
var Group = traceur.require(__dirname + '/../models/group.js');

var multiparty = require('multiparty');


exports.index = (req, res)=>{
  if (req.session.questConfirm) {
    var questConfirm = req.session.questConfirm;
    req.session.questConfirm = false;
    res.render('users/index', {title: 'Nashploration', questConfirm:questConfirm});
  } else {
    res.render('users/index', {title: 'Nashploration'});
  }
};

exports.profile = (req, res)=>{
  // need to query user from url path & check against res.locals to determine what version of profile is rendered
  User.findByUserName(req.params.userName, user=>{
    if (user) {
      if (user._id.equals(res.locals.user._id)) {
        res.render('users/profile', {title: 'Nashploration', userProfile: user, otherProfile: null});
      } else {
        res.render('users/profile', {title: 'Nashploration', userProfile: null, otherProfile: user});
      }
    } else {
      // flash error here to notify user that userName doesn't exist
      res.redirect('/dashboard');
    }
  });
};

exports.register = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var photoObj = files.photo[0];
    var userName = fields.userName[0].split(' ').map(w=>w.trim()).map(w=>w.toLowerCase()).join('');
    Group.findByGroupCode(fields.groupCode[0], group=>{
      if (!group) {
        res.redirect('/');
      }
      User.register(fields, userName, (u)=>{
        if (u) {
          u.processPhoto(photoObj, (newPhoto)=>{
            u.photo = newPhoto;
            group.joinGroup(u);
            u.save(()=>{
              group.save(()=>{
                res.locals.user = u;
                req.session.userId = u._id;
                res.redirect(`/users/${u.userName}`);
              });
            });
          });
        } else {
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
          u.save(()=>{
            group.save(()=>{
              res.locals.user = u;
              req.session.userId = u._id;
              res.redirect(`/users/${u.userName}`);
            });
          });
        } else {
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

exports.showCheckIn = (req, res)=>{
  res.render('users/checkIn', {title: 'Nashploration', locationId: req.params.locationId, lat: req.query.lat, lng: req.query.lng});
};

exports.checkIn = (req, res)=>{
  var currLoc = {lat: req.query.lat, lng: req.query.lng};

  Location.findById(req.params.locationId, (err, location)=>{
    location.saveComment(req.body.comment, currLoc, res.locals.user._id, ()=>{
      Quest.findById(res.locals.user.activeQuest.questId, (err,quest)=>{
        res.locals.user.saveCheckIn(quest.checkIns, req.params.locationId, ()=>{
          res.locals.user.save(()=>{
            location.save(()=>{
            res.redirect('/dashboard');
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
