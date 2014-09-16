/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'nashploration-test';

var cp = require('child_process');
var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var userFactory = traceur.require(__dirname + '/../../helpers/user-factory.js');
var _ = require('lodash');
var User;
var Group;
var Quest;

var bob;
var jim;
var group;

describe('User', function(){
  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      Group = traceur.require(__dirname + '/../../../app/models/group.js');
      Quest = traceur.require(__dirname + '/../../../app/models/quest.js');
      global.nss.db.collection('quests').drop(function(){
        cp.execFile(__dirname + '/../../fixtures/before.sh', function(err, stdout, stderr){
          done();
        });
      });
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      global.nss.db.collection('groups').drop(function(){
        User.register({email:'bob@aol.com', password:'123456', nickName:'badass', userName:'bobbydee'}, function(user){
          User.register({email:'jim@aol.com', password:'123456', nickName:'dingus', userName:'jimmyboy'}, function(u){
            cp.execFile(__dirname + '/../../fixtures/before.sh', function(err, stdout, stderr){
              userFactory('user', function(users){
                bob = user;
                jim = u;
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('.register', function(){
    it('should successfully create a user', function(done){
      User.register({email:'ann@aol.com', password:'123456', nickName:'Little Orphan', userName:'Annie'}, function(u){
        User.findById(u._id, function(err, user){
          expect(user).to.be.ok;
          expect(user).to.be.an.instanceof(User);
          expect(user._id).to.be.an.instanceof(Mongo.ObjectID);
          expect(user.email).to.equal('ann@aol.com');
          expect(user.nickName).to.equal('Little Orphan');
          expect(user.userName).to.equal('Annie');
          expect(user.password).to.have.length(60);
          done();
        });
      });
    });

    it('should NOT successfully create a user', function(done){
      User.register({email:'bob@aol.com', password:'123456', nickName:'badass', userName:'bobbdee'}, function(u){
        expect(User._id).to.be.undefined;
        done();
      });
    });
  });

  describe('.findByEmail', function(){
    it('should find a user', function(done){
      User.findByEmail('bob@aol.com', function(user){
        expect(user).to.be.ok;
        expect(user._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(user.email).to.equal('bob@aol.com');
        expect(user.nickName).to.equal('badass');
        expect(user.userName).to.equal('bobbydee');
        expect(user.password).to.have.length(60);
        done();
      });
    });

    it('should not find user - bad email', function(done){
      User.findByEmail('wrong@nomail.com', function(user){
        expect(user).to.be.null;
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should find a user', function(done){
      User.register({email:'ann@aol.com', password:'123456', nickName:'Little Orphan', userName:'Annie'}, function(u){
        User.findById(u._id, function(err, user){
          expect(u.email).to.equal('ann@aol.com');
          expect(u.nickName).to.equal('Little Orphan');
          expect(u.userName).to.equal('Annie');
          done();
        });
      });
    });
  });

  describe('.findByUserName', function(){
    it('should find a user', function(done){
      User.findByUserName('bobbydee', function(user){
        expect(user).to.be.ok;
        expect(user._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(user.email).to.equal('bob@aol.com');
        expect(user.nickName).to.equal('badass');
        expect(user.password).to.have.length(60);
        done();
      });
    });

    it('should not find user - bad email', function(done){
      User.findByUserName('wrongUserName', function(user){
        expect(user).to.be.null;
        done();
      });
    });
  });

  describe('.findManyById', function(){
    it('should find many users from array of ids', function(done){
      var ids = [jim._id, bob._id];
      User.findManyById(ids, function(users){
        expect(users.length).to.equal(2);
        expect(users[0].userName).to.equal('bobbydee');
        expect(users[1].userName).to.equal('jimmyboy');
        done();
      });
    });

    it('should not find users - no ids', function(done){
      var ids = [''];
      User.findManyById(ids, function(users){
        expect(users.length).to.equal(0);
        done();
      });
    });
  });

  describe('.findManyUsersByGroup', function(){
    beforeEach(function(done){
      group = new Group(bob._id, {title: 'mr. dylan\'s class', description: 'The coolest teacher ever'});
      group.save(function(){
        done();
      });
    });

    it('should find all the users in group', function(done){
      group.joinGroup(jim);
      group.joinGroup(bob);
      group.save(function(){
        User.findManyUsersByGroup(group, function(users){
          expect(users.length).to.equal(2);
          expect(users[0]).to.be.ok;
          expect(users[0]).to.be.instanceof(Object);
          expect(users[0]._id).to.be.instanceof(Mongo.ObjectID);
          done();
        });
      });
    });

    it('should not find any users - none in group', function(done){
      User.findManyUsersByGroup(group, function(users){
        expect(users.length).to.equal(0);
        done();
      });
    });
  });

  describe('.searchByName', function(done){
    it('should find a user by userName', function(done){
      User.searchByName('bob', function(users){
        expect(users.length).to.equal(1);
        expect(users[0]).to.be.instanceof(Object);
        expect(users[0].userName).to.equal('bobbydee');
        done();
      });
    });

    it('should not find a user', function(done){
      User.searchByName('notauser', function(users){
        expect(users.length).to.equal(0);
        done();
      });
    });
  });

  describe('#updateInfo', function(done){
    it('should update userName', function(done){
      bob.updateInfo({userName:'bobber'}, function(user){
        expect(user).to.be.ok;
        expect(user.userName).to.equal('bobber');
        done();
      });
    });

    it('should update password', function(done){
      var oldBob = bob;
      bob.updateInfo({password: 'aaaaaa'}, function(user){
        expect(user.password).to.not.equal(oldBob.password);
        expect(user.password).to.have.length(60);
        done();
      });
    });

    it('should update nickName', function(done){
      var oldBob = bob;
      bob.updateInfo({nickName: 'booby'}, function(user){
        expect(user).to.be.ok;
        expect(user.nickName).to.equal('booby');
        expect(user.nickName).to.not.equal(oldBob.nickName);
        done();
      });
    });

    it('should update email', function(done){
      var oldBob = bob;
      bob.updateInfo({email: 'bob@me.com'}, function(user){
        expect(user).to.be.ok;
        expect(user.email).to.not.equal(oldBob.email);
        expect(user.email).to.equal('bob@me.com');
        done();
      });
    });
  });

  describe('#addQuests', function(done){
    it('should add the quest object id to user object', function(done){
      var quest = new Quest(bob._id, ['objectid1232433'], {name:'questLove', description:'some quest'}, [jim._id], null);
      quest.save(function(){
        bob.addQuest(quest._id);
        expect(bob.myQuests[0]).to.equal(quest._id);
        done();
      });
    });
  });

  describe('#makeActiveQuest', function(done){
    it('should make a quest active', function(done){
      User.findByEmail('a@a.com', function(user){
        user = _.create(User.prototype, user);
        Quest.findById('5417641b4705ef8abd482111', function(err, quest){
          user.makeActiveQuest(quest._id);
          expect(user.activeQuest.questId).to.equal(quest._id);
          expect(user.activeQuest.questId).to.be.instanceof(Mongo.ObjectID);
          done();
        });
      });
    });

    it('should make an activeQuest into a startedQuest when second quest is activated', function(done){
      Quest.findById('5417641b4705ef8abd482111', function(err, quest){
        bob.makeActiveQuest(quest._id);
        Quest.findById('5417641b4705ef8abd482112', function(err, quest2){
          bob.makeActiveQuest(quest2._id);
          expect(bob.activeQuest.questId).to.not.equal(quest._id);
          expect(bob.activeQuest.questId).to.equal(quest2._id);
          expect(bob.startedQuests[0].questId).to.equal(quest._id);
          done();
        });
      });
    });
  });

});
