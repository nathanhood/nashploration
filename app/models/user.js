'use strict';

var users = global.nss.db.collection('users');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/../models/base.js');
var _ = require('lodash');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');


class User{
  constructor(fields, userName, fn){
    this.email = fields.email[0];
    this.password = fields.password[0];
    this.userName = userName;
    this.nickName = fields.nickName[0];
    this.badges = []; // Object IDs
    this.level = 'Explorer';
    this.groups = []; // Object IDs
    this.photo = null; // add photo object from processPhoto
    this.checkIns = []; // Object IDs
    this.createdQuests = []; // Object IDs
    this.activeQuests = null; // Object IDs
    this.myQuests = [];
    this.completedQuests = []; // Object IDs
    // this.streetViewQuizzes = []; // Object IDs
  }


  processPhoto(photo, fn) {
    if(photo.size) {
      var name = crypto.randomBytes(12).toString('hex') + path.extname(photo.originalFilename).toLowerCase();
      var file = `/img/${this._id}/${name}`;

      var newPhoto = {};
      newPhoto.fileName = name;
      newPhoto.filePath = file;
      newPhoto.origFileName = photo.originalFilename;

      var userDir = `${__dirname}/../static/img/${this._id}`;
      var fullDir = `${userDir}/${name}`;

      if(!fs.existsSync(userDir)){fs.mkdirSync(userDir);}
      fs.renameSync(photo.path, fullDir);
      fn(newPhoto);
    } else {
      fn(null);
    }
  }

  save(fn){
    users.save(this, ()=>{
      _.create(User.prototype, this);
      fn();
    });
  }

  static register(fields, userName, fn){
    users.findOne({email:fields.email[0]}, (err, u)=>{
      users.findOne({userName:userName}, (err, u2)=>{
        if(u || u2){//if user email or username exists,
          fn(null); // need error message to display
        }else{
          var user = new User(fields, userName);
          user.password = bcrypt.hashSync(user.password, 8); //hashed/encrypted version of password
          user.save(()=>{
            fn(user);
          });
        }
      });
    });
  }

  static login(obj, fn) {
    users.findOne({userName:obj.userName}, (e,u)=> {
      if (u) {
        var isMatch = bcrypt.compareSync(obj.password, u.password);
        if (isMatch) {
          fn(u);
        } else {
          fn(null);
        }
      } else {
        fn(null);
      }
    });
  }

  static findById(id, fn){
    Base.findById(id, users, User, fn);
  }

  static findByUserName(userName, fn){
    users.findOne({userName:userName}, (err, user)=>{
      user = _.create(User.prototype, user);
      fn(user);
    });
  }
}

module.exports = User; //exporting Class out
