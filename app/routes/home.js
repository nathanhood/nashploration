'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');

exports.index = (req, res)=>{
  if(res.locals.user){
    res.redirect('/dashboard');
  }else{
    res.render('home/index', {title: 'Nashploration', registerAndLogin: req.flash('registerAndLogin')});
  }
};

exports.confirmation = (req, res)=>{
  if (req.params.groupCode) {
    var groupCode = req.params.groupCode;
    res.render('home/confirmation', {title: 'Nashploration', code:groupCode});
  }
};

exports.forgotPassword = (req, res)=>{
  res.render('home/forgot-password', {title: 'Nashploration', forgotPasswordConfirm: req.flash('forgotPasswordConfirm')});
};

exports.authenticateEmail = (req, res)=>{
  User.findByEmail(req.body.email, user=>{
    if (user) {
      res.send(user);
    } else {
      res.send({email: null});
    }
  });
};

exports.resetPassword = (req, res)=>{
  User.findById(req.body.userId, (err, user)=>{
    req.body.password = User.generateTemporaryPassword();
    user.resetPassword(req.body.password);
    User.sendPasswordResetEmail(req.body, ()=>{
      user.save(()=>{
        req.flash('forgotPasswordConfirm', 'You have been sent an email to reset your password. Please check your junk folder if you do not see it arrive in your inbox');
        res.redirect('/forgot-password');
      });
    });
  });
};
