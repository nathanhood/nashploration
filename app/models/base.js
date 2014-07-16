'use strict';

var Mongo = require('mongodb');
var _ = require('lodash');

class Base{
  static findById(id, collection, model, fn){
    if(typeof id === 'string'){
      if(id.length !== 24){fn(null, null); return;}
      id = Mongo.ObjectID(id);
    }

    if(!(id instanceof Mongo.ObjectID)){fn(null, null); return;}
    collection.findOne({_id:id}, (err, obj)=>{
      if(obj){
        obj = _.create(model.prototype, obj);
        fn(null, obj);
      } else {
        fn(null, null);
      }
    });
  }

  static findAllByUserId(userId, collection, model, fn){
    if(typeof userId === 'string'){
      if(userId.length !== 24){fn(null); return;}
      userId = Mongo.ObjectID(userId);
    }

    if(!(userId instanceof Mongo.ObjectID)){fn(null); return;}

    collection.find({userId:userId}).toArray((e,objs)=>{
      objs = objs.map(o=>_.create(model.prototype, o));
      fn(objs);
    });
  }

  static findAll(collection, model, fn){
    collection.find({}).toArray((err, records)=>{
      records = records.map(r=>_.create(model.prototype, r));
      fn(records);
    });
  }
}

module.exports = Base;
