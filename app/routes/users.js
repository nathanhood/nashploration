'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
var multiparty = require('multiparty');


exports.index = (req, res)=>{
  res.render('users/index', {title: 'Nashploration'});
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
  res.render('users/checkIn', {title: 'Nashploration', locationId: req.params.locationId});
};
