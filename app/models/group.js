'use strict';

var groups = global.nss.db.collection('groups');
var Mongo = require('mongodb');
var _ = require('lodash');
var request = require('request');
var async = require('async');


class Group {
  constructor(ownerId, obj){
    this.name = obj.title;
    this.groupCode = obj.code;
    this.owner = ownerId;
    this.members = [];
    this.isLocked = false;
    this.quests = [];
    this.description = obj.description;
  }

  joinGroup(user){
    var exists = this.members.some(member=>{
      return (member.toHexString() === user._id.toHexString());
    });
    if (!exists) {
      this.members.push(user._id);
      user.groups.push(this._id);
    }
  }

  save(fn){
    groups.save(this, ()=>fn());
  }

  removeMember(memberId){
    var removed = _.remove(this.members, (member)=>{
      return memberId === member.toString();
    });
    return removed;
  }

  static isOwner(userId, fn){
    groups.find({owner: userId}).toArray((err, owner)=>{
      fn(owner);
    });
  }

  static findByGroupCode(code, fn){
    groups.findOne({groupCode:code}, (err, group)=>{
      if (!group) {
        fn(null);
      } else {
        group = _.create(Group.prototype, group);
          fn(group);
      }
    });
  }

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
    if(typeof groupIds === 'string'){
      groupIds = groupIds.split(',');
        groupIds = groupIds.map(id=>{
          return Mongo.ObjectID(id);
      });
    }

    groups.find({_id: { $in: groupIds } }).toArray((err, groups)=>{
      fn(groups);
    });
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

  static sendGroupInvitation(obj, user, group, fn){
    var message = {};
    message.ownerName = user.nickName;
    message.email = obj.email;
    message.name = obj.name;
    message.code = group.groupCode;
    message.groupTitle = group.name;
    message.description = group.description;
    sendVerificationEmail(message, ()=>fn());
  }

  static inviteGroupMembers(body, user, fn){
    var emails = body.emails.split(',');
    var names = body.names.split(',');
    var members = [];
    emails.forEach((email, i)=>{
      var message = {};
      message.ownerName = user.nickName;
      message.email = email;
      message.name = names[i];
      message.code = body.code;
      message.groupTitle = body.title;
      message.description = body.description;
      members.push(message);
    });
    async.map(members, sendVerificationEmail, ()=>fn());
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
  form.append('subject', 'Nashploration: Group Invitation');
  form.append('html', `<p>${message.name},</p>
                       <p>
                        You have been invited by ${message.ownerName} to join a Nashploration group.
                      </p>
                      <br>
                      <p><b>Group Code</b>: ${message.code}</p>
                      <p><b>Group Name</b>: ${message.groupTitle}</p>
                      <p><b>Description</b>: ${message.description}</p>
                      <p><a href="http://localhost:3000/confirmation/${message.code}">Click to Join Project</a>
                      or visit <a href="http://localhost:3000/">nashploration.com</a> to learn more!!
                      </p>`);
}


module.exports = Group;
