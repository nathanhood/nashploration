/* global describe, it, before, beforeEach */
/* jshint expr:true */
/* jshint unused: false */

'use strict';

process.env.DBNAME = 'group-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var Group;
var group1;
var group2;
var group3;
var User;
var bob;
var ann;


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
        var obj3 = {description:'a buncha other kids nashploring', title:'Mr billybobs 5th grade class'};
        group3 = new Group(ann._id, obj2);
          group1.save(function(){
            group2.save(function(){
              group3.save(function(){
                done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('.findAllByOwnerID', function(){
    it('should find all groups by user', function(done){
      Group.findAllByOwnerId(bob._id, function(bobsGroups){
        Group.findAllByOwnerId(ann._id, function(annsGroups){
        expect(bobsGroups).to.have.length(2);
        expect(annsGroups).to.have.length(1);
        expect(bobsGroups[0].title).to.equal(group1.title);
        expect(bobsGroups[1].title).to.equal(group2.title);
        expect(annsGroups[0].title).to.equal(group3.title);
        done();
        });
      });
    });
  });

  describe('.findAll', function(){
    it('should find all groups', function(done){
      Group.findAll(function(groups){
        expect(groups).to.have.length(3);
        done();
      });
    });
  });

  describe('.findByGroupId', function(){
    it('should find a group by its id', function(done){
      Group.findByGroupId(group1._id, function(g1){
        Group.findByGroupId(group2._id, function(g2){
          expect(g1.description).to.equal(group1.description);
          expect(g2.description).to.equal(group2.description);
          done();
        });
      });
    });
  });

});
