/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'group-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var Group;
var group1
var group2
var User
var bob
var ann


describe('Group', function(){
  before(function(done){
    db(function(){
      Group = traceur.require(__dirname + '/../../../app/models/group.js');
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('groups').drop(function(){
      global.nss.db.collection('users').drop(function(){
        User.register({email:'bob@aol.com', password:'123456', nickName:'badass', userName:'bobbydee'}, function(u1){
        User.register({email:'ann@aol.com', password:'123456', nickName:'Little Orphan', userName:'Annie'}, function(u2){
        bob = u1;
        ann = u2;
        var obj1 = {description:'a buncha kids nashploring', title:'Ms Johnsons 3rd grade class'};
        group1 = new Group(bob._id, obj1);
        var obj2 = {description:'a buncha older kids nashploring', title:'Mr Jacksons 5th grade class'};
        group2 = new Group(bob._id, obj2);
          group1.save(function(){
            group2.save(function(){
              done();
              });
            });
          });
        });
      });
    });
  });

    describe('#findAllByOwnerID', function(){
      it('should find all groups by user', function(done){
        Group.findAllByOwnerId(bob._id, function(records){
          expect(records).to.have.length(2);
          expect(records.title).to.equal(group1.title);
          done();
        });
      });
    });

});
