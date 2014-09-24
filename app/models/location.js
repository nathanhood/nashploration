/* jshint camelcase: false */
/* jshint unused: false */

'use strict';

var locations = global.nss.db.collection('locations');
var wikiLinks = global.nss.db.collection('wikilinks');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/../models/base.js');
var needle = require('needle');
var async = require('async');
var Mongo = require('mongodb');
var _ = require('lodash');


class Location{
  constructor(obj){ // 'number' will need to be added in route
    this.name = obj.name;
    this.address = obj.address;
    this.loc = obj.loc;
    this.description = obj.description;
    this.category = obj.class;
    this.number = obj.number;
    this.pov = {}; // {pitch: , heading: }
    this.infoEdits = []; // {text: , userId: }
    this.checkIns = []; // {userId: , coordinates: , comment: }
    this.isCivilWar = obj.isCivilWar;
    this.wiki = {name: '', wikiURL: null, wikiParams: null, otherResources: []};

    var update = {name: this.name, address: this.address, loc: this.loc, description: this.description, category: this.category, number:this.number, pov:this.pov, infoEdits:this.infoEdits, checkIns:this.checkIns,  isCivilWar:this.isCivilWar, wiki:this.wiki};
    locations.update({name: this.name}, update, {upsert: true}, (err, res)=>{
      console.log('success');
    });
  }

  saveComment(comment, coords, userId, fn){
    var date = new Date();
    var checkIn = {userId: userId, coordinates: coords, comment: comment, date: date};
    this.checkIns.push(checkIn);
    fn();
  }

  save(fn){
    locations.save(this, ()=>{
      _.create(Location.prototype, this);
      fn();
    });
  }

  static addHistory(fn){
    needle.get('http://data.nashville.gov/resource/vk65-u7my.json', function(error, response, body) {
      var markers = body;
      var allLocations = [];
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].mapped_location) {
          var name = markers[i].title.replace(/[0-9-(),]/g, '').replace(/(\r\n|\n|\r)/gm,' ');
          var locArray = [];
              locArray[0] = markers[i].mapped_location.longitude * 1;
              locArray[1] = markers[i].mapped_location.latitude * 1;
          var newLocation = {
              name: name,
              address: markers[i].location,
              loc: locArray, //saved w/ long first so we can use mongo geospatial functions
              description: markers[i].marker_text, //.replace(/s{2,}/g,' '),
              class: 'history',
              number: markers[i].number * 1,
              isCivilWar: markers[i].civil_war_site
              };
              if(allLocations.length){
                allLocations.forEach(a=>{
                  if(a.loc[0] === newLocation.loc[0] || a.loc[1] === newLocation.loc[1]){
                    newLocation.loc[0] = (newLocation.loc[0] - 0.00005);
                  }
                });
              }
                allLocations.push(newLocation);

            var location = new Location(newLocation);
        }
      }
        locations.ensureIndex({ loc : '2dsphere' }, (err, res)=>{
          console.log(res);
        });
      fn(body.length);
    });
  }

  static findFilteredResults(params, fn){
    var query = {description: { $regex: params, $options: 'i'}};

    if(params === 'Civil War Sites'){
      query = {isCivilWar: 'X'};
    }

    locations.find(query).toArray((err, loc)=>{
      fn(loc);
    });
  }

  static searchByNameAndDesc(query, fn){
    locations.find( { $or: [ { name: { $regex: query, $options: 'i'} }, { description: {$regex: query, $options: 'i'} } ] }).sort({name: 1}).toArray((err, results)=>{
      fn(results);
    });
  }

  static findAll(fn){
    locations.find({}).toArray((err, loc)=>{
      fn(loc);
    });
  }

  static findById(id, fn){
    Base.findById(id, locations, Location, fn);
  }

  static radialSearch(coords, fn){
    var lat = coords.lat * 1;
    var long = coords.long * 1;
    var currentLoc = [long, lat];
      // # /3959 converts to radians which mongo needs: Richmond
      //the numerator is in miles
      locations.find({loc: {$geoWithin: {$centerSphere: [currentLoc,  0.035 / 3959]}}}).toArray((err, locs)=>{
        fn(locs);
      });
  }

  static findActiveQuestLocations(questLocs, userLocs,  fn){
    userLocs.forEach(q=>{
      questLocs.push(q);
    });
    async.map(questLocs, findQuestLocsById, (e, locs)=>{
      var minusDups = removeAllDups(locs);
        fn(minusDups);
    });
  }

  static removeDuplicates(allLocs, questOrCheckInLocs, fn){
    questOrCheckInLocs.forEach(q=>{
      allLocs.push(q);
      allLocs.push(q);
    });

    var minusDups = removeAllDups(allLocs);
      fn(minusDups);
  }

  static findManyById(locationIds, fn){

    if(typeof locationIds === 'string' && locationIds.length >= 24){
      locationIds = locationIds.split(',');
        locationIds = locationIds.map(id=>{
          return Mongo.ObjectID(id);
      });
    } else if ( locationIds === ''){
      locationIds = [null];
    }

    locations.find({_id: { $in: locationIds } }).toArray((err, locations)=>{
      fn(locations);
    });
  }

  static findAllCheckInIds(checkIns, fn){
    var checkInIds = [];
      checkIns.forEach(c=>{
        checkInIds.push(c.locId);
      });

    locations.find({_id: { $in: checkInIds } }).toArray((err, locations)=>{
      fn(locations);
    });
  }


  static accumulateLocationIds(locations, fn){
    var ids = [];
    locations.forEach(location=>{
      ids.push(location._id);
    });
    fn(ids);
  }

  static matchUserToComment(users, checkIns, fn){
    var allComments = [];
    checkIns.forEach(c=>{
      users.forEach(u=>{
        if(u._id.equals(c.userId)){
          var daysFromComment = (Math.abs(new Date() - c.date) / 86400000).toFixed(0); //milliseconds in a day
            if(daysFromComment < 1){
              daysFromComment = 'Today';
            }else if(daysFromComment >= 1 && daysFromComment < 2){
              daysFromComment = '1 day ago';
            }else{
              daysFromComment = `${daysFromComment} days ago`;
            }
          var userComment = {userName: u.userName, userId: u._id, userPhoto: u.photo.filePath, comment: c.comment, daysFromComment: daysFromComment };
          allComments.push(userComment);
        }
      });
    });

    fn(allComments);
  }

  static matchCheckInWithLoc(checkIns, locations, fn){
    var allCheckins = [];
    locations.forEach(l=>{
      checkIns.forEach(c=>{
        console.log(c);
        if(c.locId.equals(l._id)){
          var daysFromComment = (Math.abs(new Date() - c.timeStamp) / 86400000).toFixed(0);
            if(daysFromComment < 1){
                daysFromComment = 'Today';
              }else if(daysFromComment === 1){
                daysFromComment = '1 day ago';
              }else{
                daysFromComment = `${daysFromComment} days ago`;
              }
          var checkIn = {location: l, timeStamp: daysFromComment};
          allCheckins.push(checkIn);
        }
      });
    });
    fn(allCheckins);
  }
  
  static findAndAddLinks(fn){
    wikiLinks.find({}).toArray((err, links)=>{
      links.forEach(l=>{
       locations.update({ name: { $regex: l.name, $options: 'i'} }, { $set: { wiki: l } } , (err, res)=>{
          console.log(res);
        });
      });
        fn(links.length);
    });
  }

  static findWikiInfo(locName, fn){
    wikiLinks.findOne({name: { $regex: locName, $options: 'i' } }, (err, wikiInfo)=>{
      fn(wikiInfo);
    });
  }

}//end of Class

function findQuestLocsById(locId, fn){
  Base.findById(locId, locations, Location, fn);
}

function removeAllDups(data) {
  for (var i = 0; i < data.length; i++) {
      var found = false,
          id = data[i]._id;
      for (var j = i+1; j < data.length; j++) {
          if (data[j]._id.equals(id)) {
              found = true;
              data.splice(j--, 1);
          }
      }
      if (found) {
          data.splice(i--, 1);
      }
  }
  return data;
}

module.exports = Location;
