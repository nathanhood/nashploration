'use strict';

var traceur = require('traceur');
var fs = require('fs');
var async = require('async');
var Model;

module.exports = (model, fn)=>{
  Model = traceur.require(__dirname + '/../../app/models/' + model + '.js');
  var records = fs.readFileSync(__dirname + '/../../db/' + model + '.json', 'utf8');
  records = JSON.parse(records);
  async.map(records, iterator, (e,objs)=>fn(objs));
};

function iterator(record, fn){
  Model.create(record, obj=>fn(null, obj));
}
