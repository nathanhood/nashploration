'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var Location = traceur.require(__dirname + '/../models/location.js');
var Quest = traceur.require(__dirname + '/../models/quest.js');

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

exports.register = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var photoObj = files.photo[0];
    var userName = fields.userName[0].split(' ').map(w=>w.trim()).map(w=>w.toLowerCase()).join('');

    User.register(fields, userName, (u)=>{
      if (u) {
        u.processPhoto(photoObj, (newPhoto)=>{
          u.photo = newPhoto;
          u.save(()=>{
            res.locals.user = u;
            req.session.userId = u._id;
            res.redirect('/dashboard');
          });
        });
      } else {
        res.redirect('/');
      }
    });
  });
};

exports.login = (req, res)=>{
  User.login(req.body, u=>{
    if (u) {
      res.locals.user = u;
      req.session.userId = u._id;
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  });
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
