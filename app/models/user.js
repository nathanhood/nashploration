'use strict';

var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var _ = require('lodash');
var bcrypt = require('bcrypt');

class User{
  constructor(fields, files, userName){
    this.email = fields.email[0];
    this.password = fields.password[0];
    this.userName = userName;
    this.nickName = fields.nickName[0];
    this.badges = []; // Object IDs
    this.level = 'Explorer';
    this.groups = []; // Object IDs
    this.image = files.image[0].originalFilename; // add entire normalized file path
    this.checkIns = []; // Object IDs
    this.createdQuests = []; // Object IDs
    this.activeQuests = []; // Object IDs
    this.completedQuests = []; // Object IDs
    // this.streetViewQuizzes = []; // Object IDs
}

  register(fn){
    users.findOne({email:this.email}, (err, u)=>{
      users.findOne({userName:this.userName}, (err, u2)=>{
        if(u || u2){//if user email or username exists,
          fn(null);

        }else{
          this.password = bcrypt.hashSync(this.password, 8); //hashed/encrypted version of password
          users.save(this, (err, u)=>{
            fn(u);
          });

        }

      });
    });
  }

  login(user, fn){
    var isMatch = bcrypt.compareSync(user.password, this.password); //(entered password, db password)
    if(isMatch){
      fn(this);
    }else{
      fn(null);
    }
  }

  static findByUserId(userId, fn){
    var id = Mongo.ObjectID(userId);
    console.log('ID ID ID');
    console.log(id);
    users.findOne({_id:id}, (err, user)=>{
      user = _.create(User.prototype, user);
      fn(user);
    });
  }

  static findByUserName(userName, fn){
    users.findOne({userName:userName}, (err, user)=>{
      user = _.create(User.prototype, user);
      fn(user);
    });
  }
}

module.exports = User; //exporting Class out
