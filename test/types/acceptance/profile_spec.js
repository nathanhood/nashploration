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

describe('profile page', function(){

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

  describe('GET /users/:userName/checkins - checkins page', function(){
    var cookie;

    beforeEach(function(done){
      request(app)
      .post('/login')
      .send('userName=aa')
      .send('password=aaaaaa')
      .end(function(err, res){
        var cookies = res.headers['set-cookie'];
        var one = cookies[0].split(';')[0];
        var two = cookies[1].split(';')[0];
        cookie = one + '; ' + two;
        done();
      });
    });

    it('should successfully load page', function(done){
      request(app)
      .get('/users/aa/checkins')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('All Check Ins');
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/users/aa/checkins')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

});
