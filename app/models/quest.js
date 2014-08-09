'use strict';

var quests = global.nss.db.collection('quests');
var _ = require('lodash');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/../models/base.js');


class Quest{
  constructor(userId, locationIds, name, groupUsers, groupIds){
    this.users = groupUsers;
    this.groupIds = groupIds;
    this.name = name;
    this.creator = userId;
    this.checkIns = locationIds;
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

}


module.exports = Quest; //exporting Class out
