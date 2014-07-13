'use strict';

var locations = global.nss.db.collection('locations');


class Location{
  constructor(obj){ // 'number' will need to be added in route
    this.name = obj.name;
    this.address = obj.address;
    this.gis = obj.gis;
    this.description = obj.description;
    this.category = obj.category;
    this.number = obj.number;
    this.pov = obj.pov; // {pitch: , heading: }
    this.comments = []; // {text: , userId: }
    locations.save(this, ()=>{});
  }



  static findAll(fn){
    locations.find({}).toArray((err, loc)=>{
      fn(loc);
    });
  }
}


module.exports = Location;
