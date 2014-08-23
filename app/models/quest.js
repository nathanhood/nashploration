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
    if (body.isPrivate === 'true') {
      this.isPrivate = true;
    } else {
      this.isPrivate = false;
    }
  //   this.image = files.image[0].originalFilename OR default image path;
  }


  save(fn){
    quests.save(this, ()=>{
      _.create(Quest.prototype, this);
      fn();
    });
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

  static searchByName(query, fn){
    quests.find({ name: { $regex: query, $options: 'i'}, isPrivate: false }).toArray((err, results)=>{
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
