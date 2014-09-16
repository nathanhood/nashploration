/* global describe, before, beforeEach, it */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'nashploration-test';

var expect = require('chai').expect;
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var userFactory = traceur.require(__dirname + '/../../helpers/user-factory.js');
var app = require('../../../app/app');
var request = require('supertest');

var User;

describe('register, login and logout', function(){

  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      userFactory('user', function(users){
        done();
      });
    });
  });


  describe('sign up without group code', function(){
    it('should successfully sign up a user', function(done){
      request(app)
      .post('/register')
      .send('userName=testuser')
      .send('nickName=test hood')
      .send('email=test@user.com')
      .send('password=aaaaaa')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/testuser');
        done();
      });
    });

    it('should not sign up user - duplicate email', function(done){
      request(app)
      .post('/register')
      .send('userName=aa')
      .send('nickName=a')
      .send('email=a@a.com')
      .send('password=aaaaaa')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.not.equal('/users/testuser');
        expect(res.headers.location).to.equal('/');
        done();
      });
    });
  });

  describe('sign up with group code', function(){
    it('should successfully sign up a user', function(done){
      request(app)
      .post('/register')
      .send('userName=testuser')
      .send('nickName=test hood')
      .send('email=test@user.com')
      .send('password=aaaaaa')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/testuser');
        done();
      });
    });
  });

  describe('sign in', function(){
    it('should successfully sign in user', function(done){
      request(app)
      .post('/login')
      .send('userName=aa')
      .send('password=aaaaaa')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/dashboard');
        done();
      });
    });

    it('should not successfully log in user - wrong username', function(done){
      request(app)
      .post('/login')
      .send('userName=ab')
      .send('password=aaaaaa')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    });

    it('should not successfully log in user - wrong email', function(done){
      request(app)
      .post('/login')
      .send('userName=aa')
      .send('password=wrong')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    });
  });

  describe('log out', function(){
    it('should successfully log out user', function(done){
      request(app)
      .post('/logout')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    });
  });

});
