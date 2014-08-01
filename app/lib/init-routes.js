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
  var quests = traceur.require(__dirname + '/../routes/quests.js');

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);

  app.post('/register', dbg, users.register);
  app.post('/login', dbg, users.login);
  app.post('/logout', dbg, users.logout);

  /* ------ MAP ------*/
  app.get('/allLocations', dbg, locations.index);
  app.get('/getAllLocations', dbg, locations.getLocations); //ajax call to get locations from db
  app.get('/getCivilWarLocations', dbg, locations.getCivilWarLocations); //ajax call to get locations from db
  app.get('/getAndrewJacksonLocations', dbg, locations.getAndrewJacksonLocations);
  app.post('/addHistory', dbg, locations.addHistory);

  app.get('/locations/:location', dbg, locations.locationDetails);

  app.get('/getCloseLocs/:lat/:long', dbg, locations.findCloseLocs); //ajax call for finding locations around users current location
  app.get('/resetCloseLocations/:closeLocations', dbg, locations.resetLocations);

  app.all('*', users.bounce);


  /* ------ Secure Requests Below This Point ---- */
  app.get('/checkIn/:locationId', dbg, users.showCheckIn); //gets checkin page

  /* ------------ Users ------------ */
  app.get('/users/home', dbg, users.index);


  /* ----------- Quests ------------- */
  app.get('/quests/new', dbg, quests.new);
  app.post('/quests/create', dbg, quests.create);

  console.log('Routes Loaded');
  fn();
}
