'use strict';

var app = require('../../app/app');
var request = require('supertest');

module.exports = fn=>{
  request(app)
  .get('/')
  .end(fn);
};
