'use strict';

var groups = global.nss.db.collection('groups');
var Mongo = require('mongodb');
var _ = require('lodash');


class Group {
//   constructor(ownerId, groupName, fn){
//     this.name = groupName;
//     this.groupCode = groupCode();
//     this.owner = ownerId;
//     this.members = [];
//     this.isLocked = false;
//     this.quests = [];
//     this.description =
//   }
//
//   joinGroup(user){
//     this.members.push(user);
//     console.log('THIS IS THE USER');
//     console.log(user);
//     console.log('THIS GROUPS MEMBERs');
//     console.log(this.members);
//
//   }
//
//
//
//     save(fn){
//     groups.save(this, ()=>fn());
//   }
//
//    isMember(userId){
//      groups.findOne({members: userId}, (err, user)=>{
//        if(user){
//          return true;
//        }else{
//          return false;
//        }
//
//      });
//
//    }
//
//   static isOwner(userId, fn){
//     groups.find({owner: userId}).toArray((err, owner)=>{
//       fn(owner);
//     });
//   }
//
  static findAllByOwnerId(ownerId, fn){
    groups.find({owner: ownerId}).toArray((err, groups)=>{
      fn(groups);
    });
  }

  static findAll(fn){
    groups.find().toArray((err, groups)=>{
      fn(groups);
    });
  }

  static findByGroupId(groupId, fn){
    var id = Mongo.ObjectID(groupId);
    groups.findOne({_id:id}, (err, group)=>{
      group = _.create(Group.prototype, group);
      fn(group);
    });
  }

}

// function groupCode(){
//   var text='';
//   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   for( var i=0; i < 5; i++ ){
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//   return text;
// }


module.exports = Group;
