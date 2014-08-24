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
    this.createdQuests = [];
    this.activeQuest = {questId:null, questLocs:[]}; // Object IDs
    this.startedQuests = [];
    this.myQuests = [];
    this.completedQuests = []; // Object IDs
    // this.streetViewQuizzes = []; // Object IDs
  }

  isPreviousCheckIn(locationId, fn){
    locationId = Mongo.ObjectID(locationId);

    var previousCheckIn = this.checkIns.some(checkIn=>{
      return checkIn.equals(locationId);
    });

    fn(previousCheckIn);
  }

  getActiveQuestId(fn){
    fn(this.activeQuest.questId);
  }

  updateActiveQuest(questCheckIns, locationId) {

    var isInQuestArray = questCheckIns.some(checkInId=> {
      return checkInId.equals(locationId);
    });

    var isInActiveQuestArray = this.activeQuest.questLocs.some(locId=> {
      return locId.equals(locationId);
    });

    if(isInQuestArray === true && isInActiveQuestArray === false){
      this.activeQuest.questLocs.push(locationId);
    }
  }

  updateCheckIns(locationId){
    var isInCheckInsArray = false;
    if (this.checkIns.length) {
      isInCheckInsArray = this.checkIns.some(checkInId=>{
        return checkInId.equals(locationId);
      });
    }

    if(isInCheckInsArray === false){
      this.checkIns.push(locationId);
    }
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
      fn({filePath: '/img/assets/placeholder.png'});
    }
  }

  save(fn){
    users.save(this, ()=>{
      _.create(User.prototype, this);
      fn();
    });
  }

  isOwner(userId){
    return this._id.toString() === userId.toString();
  }

  removeGroup(groupId){
    var removed = _.remove(this.groups, (group)=>{
      return groupId === group.toString();
    });
    return removed;
  }

  makeActiveQuest(questId){
    questId = Mongo.ObjectID(questId);
    var isActive = questId.equals(this.activeQuest.questId);
    var isStarted = false;
    if (this.startedQuests.length > 0) {
      isStarted = _.remove(this.startedQuests, (quest)=>{
        return questId.equals(quest.questId);
      });
    }

    if (this.activeQuest.questId !== null) {
      this.startedQuests.push(this.activeQuest);
    }

    if (!isActive && !isStarted[0]) {
      this.activeQuest = {questId:questId, questLocs:[]};
    } else if (isStarted[0]) {
      this.activeQuest = isStarted[0];
    }
  }

  addQuest(questId){
    questId = Mongo.ObjectID(questId);
    var inMyQuests = this.myQuests.some(quest=>{
      return questId.equals(quest);
    });
    if (!inMyQuests) {
      this.myQuests.push(questId);
      return true;
    } else {
      return false;
    }
  }

  removeQuest(questId){
    questId = Mongo.ObjectID(questId);
    _.remove(this.myQuests, (quest)=>{
      return questId.equals(quest);
    });
    _.remove(this.startedQuests, (quest)=>{
      return questId.equals(quest.questId);
    });
    var isActive = questId.equals(this.activeQuest.questId);
    if (isActive) {
      this.activeQuest = {questId: null, questLocs: []};
    }
  }

  isInMyQuests(questId){
    var inMyQuests = false;
    if (this.myQuests.length > 0) {
      inMyQuests = this.myQuests.some(quest=>{
        return questId.toString() === quest.toString();
      });
    }
    return inMyQuests;
  }

  isCompletedQuest(questId){
    var completeQuest = false;
    if (this.completedQuests.length > 0) {
      completeQuest = this.completedQuests.some(quest=>{
        return questId.toString() === quest.toString();
      });
    }
    return completeQuest;
  }

  isActiveQuest(questId){
    questId = Mongo.ObjectID(questId);
    var activeQuestId = Mongo.ObjectID(this.activeQuest.questId);
    return activeQuestId.equals(questId);
  }

  static removeGroupFromUsersGroups(groupId, fn){
    groupId = Mongo.ObjectID(groupId);
    users.update({ groups: groupId }, { $pull: { groups: groupId } }, { multi: true },
      (err, res)=>{
      fn(err, res);
    });
  }

  static removeGroupFromUserCreatedGroups(groupId, fn){
    groupId = Mongo.ObjectID(groupId);
    users.update({ createdGroups: groupId }, { $pull: { createdGroups: groupId } }, { multi: true },
      (err, res)=>{
        fn(err, res);
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

  static findManyById(userIds, fn){
    if (userIds.length) {
      users.find({_id: { $in: userIds } }).toArray((err, users)=>{
        fn(users);
      });
    } else {
      fn(null);
    }
  }

  static findManyCheckInCommentsById(checkInObjs, fn){
    if (checkInObjs.length) {
      var userIdsArray = [];
      checkInObjs.forEach(c=>{
        userIdsArray.push(c.userId);
      });
      users.find({_id: { $in: userIdsArray } }).toArray((err, users)=>{
        fn(users);
      });
    } else {
      fn(null);
    }
  }

  static matchUserToComment(users, checkIns, fn){
    var allComments = [];
    checkIns.forEach(c=>{
      users.forEach(u=>{
        if(u._id.equals(c.userId)){
          var daysFromComment = (Math.abs(new Date() - c.date) / 86400000).toFixed(0); //milliseconds in a day
            if(daysFromComment < 1){
              daysFromComment = 'Today';
            }else if(daysFromComment === 1){
              daysFromComment = '1 day ago';
            }else{
              daysFromComment = `${daysFromComment} days ago`;
            }
          var userComment = {userName: u.userName, userId: u._id, userPhoto: u.photo.filePath, comment: c.comment, daysFromComment: daysFromComment };
          allComments.push(userComment);
        }
      });
    });

    fn(allComments);
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

  static searchByName(query, fn){
    users.find({ userName: { $regex: query, $options: 'i'}}).toArray((err, results)=>{
      fn(results);
    });
  }

  static findAndReplaceQuestCreators(objectArray, fn){
    if (objectArray.length) {
      var ids = objectArray.map(object=>{
        return object.creator;
      });
      users.find({_id: { $in: ids } }).toArray((err, users)=>{
        var finalArray = [];
        objectArray.forEach(quest=>{
          users.forEach(user=>{
            if (user._id.equals(quest.creator)) {
              quest.creator = user;
              finalArray.push(quest);
            }
          });
        });
        fn(finalArray);
      });
    } else {
      fn(null);
    }
  }
}

module.exports = User; //exporting Class out
