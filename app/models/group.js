'use strict';

var groups = global.nss.db.collection('groups');
var Mongo = require('mongodb');
var _ = require('lodash');
// var request = require('request');


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

  static findManyById(groupIds, fn){
    if (typeof groupIds === 'string' && groupIds.length >= 24) {
      groupIds = groupIds.split(',');
      var objIds = groupIds.map(id=>{
        return Mongo.ObjectID(id);
      });
      groups.find({_id: { $in: objIds } }).toArray((err, groups)=>{
        fn(groups);
      });
    } else {
      fn(null);
    }
  }

  static accumulateUsersFromGroups(groups){
    var users = [];
    groups.forEach(group=>{
      group.members.forEach(user=>{
        user = user.toString();
        console.log(user);
        users.push(user);
      });
    });
    users = _.unique(users);
    users = users.map(user=>{
      user = Mongo.ObjectID(user);
      return user;
    });
    return users;
  }

  static accumulateGroupIds(groups){
    var ids = [];
    groups.forEach(group=>{
      ids.push(group._id);
    });
    return ids;
  }

  static groupCode(){
    var text='';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i=0; i < 5; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  static inviteGroupMembers(body, fn){
    var emails = body.emails.split(',');
    var names = body.names.split(',');
    var members = [];
    emails.forEach((email, i)=>{
      var message = {};
      message.email = email;
      message.name = names[i];
      message.code = body.code;
      message.groupTitle = body.title;
      members.push(message);
    });
  }
// need to submit each message asynchronously
// need to create group in routes
// need to figure out how to transfer code through email and back through link/login
}

// function sendVerificationEmail(message, fn){
//   var key = process.env.MAILGUN;
//   var url = 'https://api:' + key + '@api.mailgun.net/v2/sandboxca5bcce9a29f4c5da3e715d4fa6b3ae2.mailgun.org/messages';
//   var post = request.post(url, function(err, response, body){
//     fn(message); //callback from static inviteGroupMembers function being called
//   });
//
//   var form = post.form();
//   form.append('from', 'admin@musecollective.com');
//   form.append('to', message.email);
//   form.append('subject', 'Muse[collective]: Collaboration Invite');
//   form.append('html', `<p>You have been invited by ${message.inviteeName} to collaborate on a Muse[collectve] project.</p>
//                       <br>
//                       <h4>Message from ${message.inviteeName}:</h4>
//                       <p>${message.personalMessage}</p>
//                       <a href="http://localhost:3000/confirmInvite/${message.projId}">Click to Join Project</a>`);
// }


module.exports = Group;
