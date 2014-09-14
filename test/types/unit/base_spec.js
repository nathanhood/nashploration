/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'blueprint-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var traceur = require('traceur');
var db = traceur.require(__dirname + '/../../helpers/db.js');
var Base;

describe('Base', function(){
  before(function(done){
    db(function(){
      Base = traceur.require(__dirname + '/../../../app/models/base.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('bases').drop(function(){
      done();
    });
  });

});
