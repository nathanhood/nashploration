'use strict';

// var quests = global.nss.db.collection('quests');


class Quest{
  constructor(obj, userId){
    this.users = obj.groupUsers;
    this.groupId = obj.groupId;
    this.name = obj.name;
    this.creator = userId;
    this.checkIns = obj.checkIns;
  //   this.image = files.image[0].originalFilename OR default image path;
  }
}


module.exports = Quest; //exporting Class out
