/* global describe, before, beforeEach, it */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'nashploration-test';

var cp = require('child_process');
var expect = require('chai').expect;
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var userFactory = traceur.require(__dirname + '/../../helpers/user-factory.js');
var app = require('../../../app/app');
var request = require('supertest');

var User;
var Quest;

describe('users', function(){

  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      Quest = traceur.require(__dirname + '/../../../app/models/quest.js');
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


  describe('GET /quests - find quests to join', function(){
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
      .get('/quests')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Find Quest');
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('GET /quests/view - view your quests (joined, created, completed)', function(){
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
      .get('/quests/view')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Quest List');
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/view')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('GET /quests/new - create new quest', function(){
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
      .get('/quests/new')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Create Quest');
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/new')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('GET /quests/class-confirmation - confirmation for upgrading class', function(){
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
      .get('/quests/class-confirmation')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Congratulations');
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/class-confirmation')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('GET /quests/quest-confirmation - confirmation for completing quest', function(){
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
        global.nss.db.collection('quests').drop(function(){
          cp.execFile(__dirname + '/../../fixtures/before.sh', function(err, stdout, stderr){
            done();
          });
        });
      });
    });

    it('should successfully load page', function(done){
      User.findById('5417641b4705ef8abd481111', function(err, aa){
        Quest.findById('5417641b4705ef8abd482111', function(err, quest){
          aa.completedQuests.push(quest._id);
          aa.save(function(){
            request(app)
            .get('/quests/quest-confirmation')
            .set('cookie', cookie)
            .end(function(err, res){
              expect(res.status).to.equal(200);
              expect(res.text).to.include('Congratulations');
              done();
            });
          });
        });
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/quest-confirmation')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('GET /quests/class-quest-confirmation - confirmation for completing quest && upgrading class', function(){
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
        global.nss.db.collection('quests').drop(function(){
          cp.execFile(__dirname + '/../../fixtures/before.sh', function(err, stdout, stderr){
            done();
          });
        });
      });
    });

    it('should successfully load page', function(done){
      User.findById('5417641b4705ef8abd481111', function(err, aa){
        Quest.findById('5417641b4705ef8abd482111', function(err, quest){
          aa.completedQuests.push(quest._id);
          aa.save(function(){
            request(app)
            .get('/quests/class-quest-confirmation')
            .set('cookie', cookie)
            .end(function(err, res){
              expect(res.status).to.equal(200);
              expect(res.text).to.include('Congratulations');
              done();
            });
          });
        });
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/class-quest-confirmation')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('GET /quests/show/:questId - show a quest', function(){
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
        global.nss.db.collection('quests').drop(function(){
          cp.execFile(__dirname + '/../../fixtures/before.sh', function(err, stdout, stderr){
            done();
          });
        });
      });
    });

    it('should successfully load page', function(done){
      request(app)
      .get('/quests/show/5417641b4705ef8abd482111')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/show/5417641b4705ef8abd482111')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });


  describe('GET /quests/edit/:questId - show a quest', function(){
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
        global.nss.db.collection('quests').drop(function(){
          cp.execFile(__dirname + '/../../fixtures/before.sh', function(err, stdout, stderr){
            done();
          });
        });
      });
    });

    it('should successfully load page', function(done){
      request(app)
      .get('/quests/edit/5417641b4705ef8abd482111')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });

    it('should not load page - not authorized', function(done){
      request(app)
      .get('/quests/edit/5417641b4705ef8abd482111')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

});
