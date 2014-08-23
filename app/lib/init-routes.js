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
  var groups = traceur.require(__dirname + '/../routes/groups.js');

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);
  app.get('/confirmation/:groupCode', dbg, home.confirmation);

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

  app.get('/getActiveQuestLocations', dbg, users.getActiveQuestLocations);

  /* ------ Secure Requests Below This Point ---- */

  app.get('/checkIn/:locationId', dbg, users.showCheckIn); //gets checkin page

  /* ------------ Users ------------ */
  app.get('/dashboard', dbg, users.index);
  app.get('/users/:userName', dbg, users.profile);
  app.post('/users/checkin/:locationId', dbg, users.checkIn);


  /* ----------- Quests ------------- */
  app.get('/quests/new', dbg, quests.new);
  app.get('/quests/view', dbg, quests.view);
  app.get('/quests/show/:questId', dbg, quests.show);
  app.post('/quests/create', dbg, quests.create);
  app.post('/quests/create-quest-map', dbg, quests.questMap);


  /* ----------- Groups ------------- */
  app.get('/groups/new', dbg, groups.new);
  app.get('/groups/view', dbg, groups.view);
  app.get('/groups/show/:groupId', dbg, groups.show);
  app.get('/groups/edit/:groupId', dbg, groups.edit);
  app.post('/groups/send-invitation', dbg, groups.sendInvitation);
  app.post('/groups/create', dbg, groups.create);
  app.post('/groups/remove-member', dbg, groups.removeMember);
  app.post('/groups/delete', dbg, groups.delete);

  console.log('Routes Loaded');
  fn();
}
