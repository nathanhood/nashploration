'use strict';

var users = global.nss.db.collection('users');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/../models/base.js');
var _ = require('lodash');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var request = require('request');
var Mongo = require('mongodb');



class User{
  constructor(fields, userName, fn){
    this.email = fields.email[0];
    this.password = fields.password[0];
    this.userName = userName;
    this.nickName = fields.nickName[0];
    this.badges = [{name: 'Couch Potato', filePath: '/img/assets/couch_potato.png'}]; // Object IDs
    this.class = 'Couch Potato';
    this.groups = []; // Object IDs
    this.photo = {fileName: null}; // add photo object from processPhoto
    this.checkIns = []; // Location IDs
    this.createdGroups = []; //Object IDs
    this.createdQuests = [];
    this.activeQuest = {questId:null, questLocs:[]}; // Object IDs
    this.startedQuests = [];
    this.myQuests = [];
    this.completedQuests = []; // Object IDs
    this.points = 0;
    // this.streetViewQuizzes = []; // Object IDs
  }

  updateInfo(userInfo, fn){
    var value = Object.keys(userInfo)[0];

    var update = { $set: {} };

    if(value === 'password'){
      var password = bcrypt.hashSync(userInfo.password, 8);
      update.$set[value] = password;
    }else{
      update.$set[value] = userInfo[value];
    }

    users.update({_id: this._id}, update, (err, res)=>{
      users.findOne({_id: this._id}, (err, user)=>{
          fn(user);
      });
    });
  }

  isInActiveQuest(locationId, quest){
    if (quest){
      var isActive = quest.checkIns.some(id=>{
        return id.toString() === locationId.toString();
      });
      return isActive;
    } else {
      return false;
    }
  }

  findCheckins(fn){
    var locationIds = [];
    this.checkIns.forEach(l=>{
      locationIds.push(l.locId);
    });
    fn(this.checkIns, locationIds);
  }

  isPreviousCheckIn(locationId, fn){
    locationId = Mongo.ObjectID(locationId);

    var previousCheckIn = this.checkIns.some(checkIn=>{
      return checkIn.locId.equals(locationId);
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
      var checkInLocIds = [];
        this.checkIns.forEach(c=>{
          checkInLocIds.push(c.locId);
        });

        isInCheckInsArray = checkInLocIds.some(checkInId=>{
          return checkInId.equals(locationId);
        });
    }

    if(isInCheckInsArray === false){
      var checkIn = {timeStamp: new Date(), locId: locationId};
      this.checkIns.push(checkIn);
    }
  }

  calculateUserScore(quests){
    var points = 0;
    if (quests.length > 0) {
      quests.forEach(quest=>{
        points += (quest.checkIns.length * 3);
      });
    }
    points += (this.checkIns.length * 5);
    this.points = points;
  }

  isActiveQuestComplete(quest){
    return quest.checkIns.length === this.activeQuest.questLocs.length;
  }

  addCompletedQuest(){
    this.completedQuests.push(this.activeQuest.questId);
    this.activeQuest.questId = null;
    this.activeQuest.questLocs = [];
  }

  updateBadgeAndClass(){
    var currentClass = this.class;

    if (this.points >= 5 && this.points < 25) {
      this.class = 'Traveler';
    } else if (this.points >= 25 && this.points < 50) {
      this.class = 'Pioneer';
    } else if (this.points >= 50 && this.points < 75) {
      this.class = 'Scout';
    } else if (this.points >= 75 && this.points < 125) {
      this.class =  'Ranger';
    } else if (this.points >=  125 && this.points < 250) {
      this.class = 'Pathfinder';
    } else if (this.points >= 250 && this.points < 500) {
      this.class = 'Adventurer';
    } else if (this.points >= 500) {
      this.class = 'Nashplorer';
    }

    if (currentClass !== this.class) {
      // this.badges.push({name: this.class, filePath: `/img/assets/${this.class.toLowerCase()}.png`});
      this.badges.push({name: this.class, filePath: '/img/assets/placeholder.png'});
      return true;
    } else {
      return false;
    }
  }

  processPhoto(photo) {
    if(photo.size) {
      if (this.photo.fileName !== null) {
        fs.unlinkSync(`${__dirname}/../static/img/${this._id}/${this.photo.fileName}`);
      }
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
      return newPhoto;
    } else {
      return {filePath: '/img/assets/placeholder.png', fileName: null};
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

  resetPassword(password){
    this.password = bcrypt.hashSync(password, 8);
  }

  static sortUsersByPoints(users){
    users.sort((a, b)=>{
      return b.points - a.points;
    });
    return users;
  }

  static findUsersWithoutQuest(users, userIds, questId){
    if (users && userIds) {
      var unavailableUsers = [];
      users.forEach(user=>{
        user.myQuests.forEach(quest=>{
          if (quest.equals(questId)) {
            unavailableUsers.push(user);
          }
        });
      });

      unavailableUsers.forEach(user=>{
        _.remove(userIds, id=>{
          return user._id.equals(id);
        });
      });
      return userIds;
    } else {
      return null;
    }
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

  static updateQuestOnManyUsers(userIds, questId, fn){
    if (userIds) {
      users.update({_id: { $in: userIds } }, { $push: { myQuests: questId } }, { multi: true }, (err, result)=>{
        fn(err, result);
      });
    } else {
      fn(null);
    }
  }

  static register(fields, userName, fn){
    users.findOne({email:fields.email[0]}, (err, u)=>{
      users.findOne({userName:userName}, (err, u2)=>{
        if(u || u2){//if user email or username exists,
          fn(null);
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

  static findManyUsersByGroup(groupObj, fn){
    users.find({_id: { $in: groupObj.members } }).toArray((err, users)=>{
      fn(users);
    });
  }

  static findManyById(userIds, fn){
    if (userIds) {
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

  static findByEmail(email, fn){
    users.findOne({ email: email }, (err, user)=>{
      fn(user);
    });
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
          var userComment = {userName: u.userName, userPhoto: u.photo.filePath, comment: c.comment, daysFromComment: daysFromComment };
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

  static findLeaders(fn){
    users.find({}).sort( { points: -1 } ).limit(10).toArray((err, users)=>{
      fn(users);
    });
  }

  static searchByName(query, fn){
    users.find({ userName: { $regex: query, $options: 'i'}}).sort({name: 1}).toArray((err, results)=>{
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

  static generateTemporaryPassword(){
    var password ='';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i=0; i < 8; i++ ) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return password;
  }

  static sendPasswordResetEmail(body, fn){
    var message = {email: body.email, userName: body.userName, password: body.password};
    sendVerificationEmail(message, ()=>{
      fn();
    });
  }
}

function sendVerificationEmail(message, fn){
  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandboxca5bcce9a29f4c5da3e715d4fa6b3ae2.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    fn(message); //callback from static inviteGroupMembers function being called
  });

  var form = post.form();
  form.append('from', 'admin@nashploration.com');
  form.append('to', message.email);
  form.append('subject', 'Nashploration: Forgot Password');
  form.append('html', `<p>Hello,</p>
                       <p>
                        Your Nashploration username is <b>${message.userName}</b>. We have received your request to reset your password.
                      </p>
                      <p>Your temporary password is: ${message.password}
                      <br>
                      <br>
                      <a href=http://localhost:3000>click here to login</a>`);
}


module.exports = User; //exporting Class out
