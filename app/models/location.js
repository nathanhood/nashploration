/* jshint camelcase: false */
/* jshint unused: false */

'use strict';

var locations = global.nss.db.collection('locations');
var needle = require('needle');


class Location{
  constructor(obj){ // 'number' will need to be added in route
    this.name = obj.name;
    this.address = obj.address;
    this.loc = obj.loc;
    this.description = obj.description;
    this.category = obj.class;
    this.number = obj.number;
    this.pov = {}; // {pitch: , heading: }
    this.comments = []; // {text: , userId: }
    this.isCivilWar = obj.isCivilWar;
    locations.save(this, ()=>{});
  }

  static addHistory(fn){
    needle.get('http://data.nashville.gov/resource/vk65-u7my.json', function(error, response, body) {

      var markers = body;
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].mapped_location) {
          var locArray = [];
              locArray[0] = markers[i].mapped_location.longitude * 1;
              locArray[1] = markers[i].mapped_location.latitude * 1;
          var newLocation = {
              name: markers[i].title,
              address: markers[i].location,
              loc: locArray, //saved w/ long first so we can use mongo geospatial functions
              description: markers[i].marker_text, //.replace(/s{2,}/g,' '),
              class: 'history',
              number: markers[i].number * 1,
              isCivilWar: markers[i].civil_war_site
              };

          var location = new Location(newLocation);
        }
      }
        locations.ensureIndex({ loc : '2dsphere' }, (err, res)=>{
          console.log(res);
        });
      fn(body.length);
    });
  }

  static filterCivilWarLocations(fn) {
    locations.find({isCivilWar: 'X'}).toArray((err, loc)=>{
      fn(loc);
    });
  }

  static filterAndrewJacksonLocations(fn) {
    locations.find({ description: { $regex: 'Andrew Jackson', $options: 'i' } }).toArray((err, loc)=>{
      fn(loc);
    });
  }

  static findAll(fn){
    locations.find({}).toArray((err, loc)=>{
      fn(loc);
    });
  }

  static findCoordinates(locName, fn){
    var name = locName.location.toUpperCase().split('-').join(' ').toString();
    locations.findOne({name: {$regex: name, $options: 'i'} }, (err, location)=>{
      fn(location);
    });
  }

  static radialSearch(coords, fn){
    console.log(coords);
    var lat = coords.lat * 1;
    var long = coords.long * 1;
    var currentLoc = [long, lat];
      // # /3959 converts to radians which mongo needs: Richmond
      //the numerator is in miles
      locations.find({loc: {$geoWithin: {$centerSphere: [currentLoc,  0.1 / 3959]}}}).toArray((err, locs)=>{
        console.log(locs.length);
        fn(locs);
      });
  }

}//end of Class


module.exports = Location;
