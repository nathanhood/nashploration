'use strict';

var _ = require('lodash');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var Mongo = require('mongodb');
var traceur = require('traceur');

var quests = global.nss.db.collection('quests');
var Base = traceur.require(__dirname + '/../models/base.js');


class Quest{
  constructor(userId, locationIds, fields, groupUsers, groupIds){
    this.name = fields.name[0];
    this.description = fields.description[0];
    this.groupUsers = groupUsers;
    this.groupIds = groupIds;
    this.creator = userId;
    this.checkIns = locationIds;
    if (fields.isPrivate) {
      this.isPrivate = true;
    } else {
      this.isPrivate = false;
    }
    this.photo = null;
  }

  save(fn){
    quests.save(this, ()=>{
      _.create(Quest.prototype, this);
      fn();
    });
  }

  addGroupUsers(groupUsers){
    groupUsers.forEach(user=>{
      this.groupUsers.push(user);
    });

    this.groupUsers = _.uniq(this.groupUsers, (user)=>{
      return user.toString();
    });
  }

  addGroupIds(groupIds){
    groupIds.forEach(group=>{
      this.groupIds.push(group);
    });
  }

  isActiveQuest(user){
    return this._id.equals(user.activeQuest.questId);
  }

  isStartedQuest(user){
    var inStartedQuests;

    if (user.startedQuests.length > 0) {
      inStartedQuests = user.startedQuests.some(quest=>{
        return this._id.equals(quest.questId);
      });
    }
    return inStartedQuests;
  }

  findStartedQuest(user){
    var quest = _.remove(user.startedQuests, (quest)=>{
      return quest.questId.equals(this._id);
    });
    return quest[0];
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
      return newPhoto;
    } else {
      return {fileName: null, filePath: '/img/assets/quest-placeholder.png', origFileName: null};
    }
  }

  findUnAddedGroupIds(groups){
    if (groups.length > 0){
      this.groupIds.forEach(id=>{
        _.remove(groups, group=>{
          return group._id.equals(id);
        });
      });
      return groups;
    }
  }

  static addGroupUser(quest, groupUser){
    quest.groupUsers.push(groupUser);

    quest.groupUsers = _.uniq(quest.groupUsers, (user)=>{
      return user.toString();
    });
  }

  static updateGroupUsers(quest, fn){
    quests.update({ _id: quest._id }, { $set: { groupUsers: quest.groupUsers } }, { multi: true }, (err, result)=>{
      fn(err, result);
    });
  }

  static removeGroupFromGroupIds(groupId, fn){
    groupId = Mongo.ObjectID(groupId);
    quests.update({ groupIds: groupId }, { $pull: { groupIds: groupId } }, { multi: true },
      (err, res)=>{
        fn(err, res);
    });
  }

  static separateCheckIns(locations, obj){
    var separated;
    if (obj.questLocs.length > 0) {
      var complete;
      obj.questLocs.forEach(loc=>{
        complete = _.remove(locations, (checkIn)=>{
          return checkIn._id.equals(loc);
        });
      });

      separated = {incomplete: locations, complete: complete};
      return separated;
    } else {
      separated = {incomplete: locations};
      return separated;
    }
  }

  static findById(id, fn){
    Base.findById(id, quests, Quest, fn);
  }

  static findManyById(questIds, fn){
    quests.find({_id: { $in: questIds } }).toArray((err, quests)=>{
      fn(quests);
    });
  }

  static findByUserId(userId, fn) {
    quests.find({creator:userId}).toArray((err, quests)=>{
      fn(quests);
    });
  }

  static findAllPublic(fn){
    quests.find({isPrivate: false}).toArray((err, quests)=>{
      fn(quests);
    });
  }

  static searchByName(query, fn){
    quests.find({ name: { $regex: query, $options: 'i'}, isPrivate: false }).sort({name: 1}).toArray((err, results)=>{
      fn(results);
    });
  }

  static findManyByCreatorForSeach(query, questIds, fn){
    quests.find({creator: questIds, name: { $regex: query, $options: 'i'} }).toArray((err, quests)=>{
      fn(quests);
    });
  }

} //end of class

module.exports = Quest; //exporting Class out
