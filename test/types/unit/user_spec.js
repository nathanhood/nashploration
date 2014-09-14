/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'blueprint-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var bob;
var User;

describe('User', function(){
  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      User.register({email:'bob@aol.com', password:'123456', nickName:'badass', userName:'bobbydee'}, function(u){
        done();
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

});
