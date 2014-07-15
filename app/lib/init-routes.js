'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var locations = traceur.require(__dirname + '/../routes/locations.js');
  var users = traceur.require(__dirname + '/../routes/users.js');

  app.get('/', dbg, home.index);

  app.get('/allLocations', dbg, locations.index);
  app.get('/getAllLocations', dbg, locations.getLocations); //ajax call to get locations from db
  app.get('/getCivilWarLocations', dbg, locations.getCivilWarLocations); //ajax call to get locations from db
  app.post('/addHistory', dbg, locations.addHistory);

  app.get('/users/home', dbg, users.index);

  console.log('Routes Loaded');
  fn();
}
