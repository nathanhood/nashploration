/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'blueprint-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
// var factory = traceur.require(__dirname + '/../../helpers/factory.js');

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
      // factory('user', function(users){
        done();
      // });
    });
  });

  describe('.register', function(){
    it('should successfully create a user', function(done){
      User.register({email:['bob@aol.com'], password:['123456'], nickName:['badass']}, 'ransolo', function(u){
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceof(User);
        expect(u._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(u.password).to.have.length(60);
        done();
      });
    });

    // it('should NOT successfully create a user', function(done){
    //   User.register({email:['sue@aol.com'], password:['does not matter']}, 'ransolo', function(u){
    //     expect(u).to.be.null;
    //     done();
    //   });
    // });
  });

});
