/* global describe, it, before, beforeEach */
/* jshint expr:true */
/* jshint unused: false */

'use strict';

process.env.DBNAME = 'quest-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var Quest;
var Group;
var group1;
var group2;
var group3;
var User;
var bob;
var ann;

describe('Quest', function(){
  before(function(done){
    db(function(){
      Group = traceur.require(__dirname + '/../../../app/models/group.js');
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      Quest = traceur.require(__dirname + '/../../../app/models/quest.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('groups').drop(function(){
      global.nss.db.collection('users').drop(function(){
        global.nss.db.collection('quests').drop(function(){
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
              var quest = new Quest(bob._id, ['objectid7777777'], {name:'quest for gold', description:'its gold jerry gooold!'}, [ann._id], null);
              quest.save(function(){
                bob.addQuest(quest._id);
                var quest2 = new Quest(bob._id, ['objectid1232433'], {name:'questLove', description:'some quest'}, [ann._id], null);
                quest2.save(function(){
                  bob.addQuest(quest._id);
                  var quest3 = new Quest(ann._id, ['objectid1111111'], {name:'test quest', description:'a quest to write lots of tests'}, [bob._id], null);
                  quest3.save(function(){
                    bob.addQuest(quest._id);
                    group1.save(function(){
                      group2.save(function(){
                        group3.save(function(){
                          group1.joinGroup(bob);
                          group1.joinGroup(ann);
                          group2.joinGroup(bob);
                          done();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('.findAllPublic', function(){
    it('should find all quests that are public', function(done){
      Quest.findAllPublic(function(allQuests){
        expect(allQuests).to.have.length(3);
        done();
      });
    });
  });

  // describe('#joinGroup', function(){
  //   it('should have a member join a group', function(done){
  //     expect(group1.members).to.have.length(2);
  //     expect(group2.members).to.have.length(1);
  //     done();
  //   });
  // });
  //
  // describe('#removeMember', function(){
  //   it('should remove a member join a group', function(done){
  //     group1.removeMember(bob._id.toHexString());
  //     expect(group1.members).to.have.length(1);
  //     done();
  //   });
  // });
  //
  // describe('#isInGroup', function(){
  //   it('should verify a member is in a group', function(done){
  //     group1.isInGroup(ann);
  //     expect('exists');
  //     group1.isInGroup(bob);
  //     expect('exists');
  //     done();
  //   });
  //   it('should verify a member is not in a group',function(){
  //     group2.isInGroup(ann);
  //     expect(ann._id.toHexString());
  //   });
  // });
  //
  // describe('.findAll', function(){
  //   it('should find all groups', function(done){
  //     Group.findAll(function(groups){
  //       expect(groups).to.have.length(3);
  //       done();
  //     });
  //   });
  // });
  //
  // describe('.findByGroupId', function(){
  //   it('should find a group by its id', function(done){
  //     Group.findByGroupId(group1._id, function(g1){
  //       Group.findByGroupId(group2._id, function(g2){
  //         expect(g1.description).to.equal(group1.description);
  //         expect(g2.description).to.equal(group2.description);
  //         done();
  //       });
  //     });
  //   });
  // });
  //
  // describe('.destroyGroup', function(){
  //   it('should find and destroy a group by its ID', function(done){
  //     Group.destroyGroup(group1._id, function(){
  //       Group.findAll(function(groups){
  //         expect(groups).to.have.length(2);
  //         done();
  //       });
  //     });
  //   });
  // });
  //
  // describe('.updateName', function(){
  //   it('should update a groups name', function(done){
  //     Group.updateName(group2._id, 'bobbydees', function(err, res){
  //       Group.findByGroupId(group2._id, function(g2){
  //         expect(g2.name).to.equal('bobbydees');
  //         done();
  //       });
  //     });
  //   });
  // });
  //
  // describe('.updateDescription', function(){
  //   it('should update a groups name', function(done){
  //     Group.updateDescription(group2._id, 'really big shoooo', function(err, res){
  //       Group.findByGroupId(group2._id, function(g2){
  //         expect(g2.description).to.equal('really big shoooo');
  //         done();
  //       });
  //     });
  //   });
  // });
  //
  // // describe('accumulateUsersFromGroups', function(){
  // //   it('should get all members', function(done)
  // //     Group.accumulateUsersFromGroups([])
  // //   });
  // // });
  //
  // describe('.groupCode', function(){
  //   it('should create a groupCode from  group._id', function(done){
  //     var code = Group.groupCode(group2._id);
  //     expect(code).to.have.length(5);
  //     done();
  //   });
  // });


});
