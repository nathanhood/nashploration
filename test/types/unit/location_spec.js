/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'blueprint-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var User;
var Location;
var location1;
var location2;

describe('User', function(){
  before(function(done){
    db(function(){
      User = traceur.require(__dirname + '/../../../app/models/user.js');
      Location = traceur.require(__dirname + '/../../../app/models/location.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      global.nss.db.collection('locations').drop(function(){
        var obj1 = {name:'my house', address:'1419 Benjamin St, Nashville TN, 37206', description: 'hipster haven'};
        location1 = new Location(obj1);
        var obj2 = {name:'your house', address:'the streets', description: 'a brown paper box'};
        location2 = new Location(obj2);
          location1.save(function(){
            location2.save(function(){
            done();
          });
        });
      });
    });
  });

  describe('findAll', function(){
    it('should find all locations', function(done){
      Location.findAll(function(records){
        expect(records.length).to.equal(2);
        expect(records[0].name).to.equal(location1.name);
        expect(records[1].name).to.equal(location2.name);
        expect(records[0].address).to.equal(location1.address);
        expect(records[0].address).to.equal(location1.address);
        expect(records[0].description).to.equal(location1.description);
        expect(records[1].description).to.equal(location2.description);
        done();
      });
    });
  });

});
