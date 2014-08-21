'use strict';

var users = global.nss.db.collection('users');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/../models/base.js');
var _ = require('lodash');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var Mongo = require('mongodb');


class User{
  constructor(fields, userName, fn){
    this.email = fields.email[0];
    this.password = fields.password[0];
    this.userName = userName;
    this.nickName = fields.nickName[0];
    this.badges = []; // Object IDs
    this.class = 'Explorer';
    this.groups = []; // Object IDs
    this.photo = null; // add photo object from processPhoto
    this.checkIns = []; // Location IDs
    this.createdGroups = []; //Object IDs
    this.createdQuests = []; // Object IDs
    this.activeQuest = {questId:null, questLocs:[]}; // Object IDs
    this.myQuests = [];
    this.completedQuests = []; // Object IDs
    // this.streetViewQuizzes = []; // Object IDs
  }

  getActiveQuestId(fn){
    fn(this.activeQuest.questId);
  }

  saveCheckIn(questCheckIns, locationId, fn){
    locationId = Mongo.ObjectID(locationId);

    var isInQuestArray = questCheckIns.some(checkInId=> {
      return checkInId.equals(locationId);
    });

    var isInActiveQuestArray = this.activeQuest.questLocs.some(locId=> {
      return locId.equals(locationId);
    });

    if(isInQuestArray === true && isInActiveQuestArray === false){
      this.activeQuest.questLocs.push(locationId);
    }

    var isInCheckInsArray = this.checkIns.some(checkInId=>{
      return checkInId.equals(locationId);
    });

    console.log(isInCheckInsArray);
    if(isInCheckInsArray === false){
      this.checkIns.push(locationId);
    }

    fn();
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
      fn({filePath: '/img/assets/placeholder-profile-pic.jpg'});
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
            _.create(User.prototype, this);
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
          u = _.create(User.prototype, u);
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
      if (user) {
        user = _.create(User.prototype, user);
        fn(user);
      } else {
        fn(null);
      }
    });
  }
}

module.exports = User; //exporting Class out
