'use strict';

var quests = global.nss.db.collection('quests');
var _ = require('lodash');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/../models/base.js');


class Quest{
  constructor(userId, locationIds, body, groupUsers, groupIds){
    this.name = body.name;
    this.description = body.description;
    this.users = groupUsers;
    this.groupIds = groupIds;
    this.creator = userId;
    this.checkIns = locationIds;
    if (body.isPublic === 'true') {
      this.isPublic = true;
    } else {
      this.isPublic = false;
    }
  //   this.image = files.image[0].originalFilename OR default image path;
  }


  save(fn){
    quests.save(this, ()=>{
      _.create(Quest.prototype, this);
      fn();
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

}

module.exports = Quest; //exporting Class out
