/* jshint camelcase: false */
/* jshint unused: false */

'use strict';

var locations = global.nss.db.collection('locations');
var needle = require('needle');


class Location{
  constructor(obj){ // 'number' will need to be added in route
    this.name = obj.name;
    this.address = obj.address;
    this.gis = obj.gis;
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
          var newLocation = {
              name: markers[i].title,
              address: markers[i].location,
              gis: [markers[i].mapped_location.latitude,markers[i].mapped_location.longitude],
              description: markers[i].marker_text, //.replace(/s{2,}/g,' '),
              class: 'history',
              number: markers[i].number * 1,
              isCivilWar: markers[i].civil_war_site
              };

          var location = new Location(newLocation);
        }
      }
      fn(body.length);
    });
  }

  static findAll(fn){
    locations.find({}).toArray((err, loc)=>{
      fn(loc);
    });
  }
}


module.exports = Location;
