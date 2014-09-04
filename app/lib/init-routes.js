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
  var searches = traceur.require(__dirname + '/../routes/searches.js');

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);
  app.get('/confirmation/:groupCode', dbg, home.confirmation);

  /* -------- FORGOT PASSWORD ----------- */
  app.get('/forgot-password', dbg, home.forgotPassword);
  app.post('/authenticate-email', dbg, home.authenticateEmail);
  app.post('/send-password-reset', dbg, home.resetPassword);

  app.post('/register', dbg, users.register);
  app.post('/login', dbg, users.login);
  app.post('/logout', dbg, users.logout);

  /* ------ MAP ------*/
  app.get('/allLocations', dbg, locations.index);
  app.get('/getFilteredLocations', dbg, locations.getLocations); //ajax call to get locations from db
  app.get('/getAllLocations', dbg, locations.getAllLocations); //ajax call to get all locations for building quest
  app.get('/getCivilWarLocations', dbg, locations.getCivilWarLocations); //ajax call to get locations from db
  app.get('/getAndrewJacksonLocations', dbg, locations.getAndrewJacksonLocations);
  app.post('/addHistory', dbg, locations.addHistory);
  app.post('/wikiLinks', dbg, locations.addLinks); //adds imported media wiki links to their respective locations

  app.get('/locations/show/:locationId', dbg, locations.locationDetailsById);
  app.get('/locations/:location', dbg, locations.locationDetails);
  app.get('/getQuestLocations/:questId', dbg, locations.getQuestLocations);

  app.get('/getCloseLocs/:lat/:long', dbg, locations.findCloseLocs); //ajax call for finding locations around users current location
  app.get('/resetCloseLocations/:closeLocations', dbg, locations.resetLocations);
  app.get('/fetchWikiInfo/:locationName', dbg, locations.findWikiInfo);

  app.all('*', users.bounce);

  app.get('/getActiveQuestLocations', dbg, users.getActiveQuestLocations);

  /* ------ Secure Requests Below This Point ---- */

  app.get('/checkIn/view-nearby', dbg, users.viewNearbyCheckIns);
  app.get('/checkIn/:locationId', dbg, users.showCheckIn); //gets checkin page

  /* ------------ Users ------------ */
  app.get('/dashboard', dbg, users.index);
  app.get('/users/leaders', dbg, users.leaderBoard);
  app.get('/users/edit/:userId', dbg, users.fetchInfo);
  app.get('/users/:userName', dbg, users.profile);
  app.get('/users/:userName/checkins', dbg, users.fetchCheckins);
  app.get('/users/:userName/badges', dbg, users.showBadges);
  app.post('/users/edit/photo/:userId', dbg, users.changePhoto);
  app.post('/users/edit/:userId', dbg, users.updateInfo);
  app.post('/users/checkin/:locationId', dbg, users.checkIn);
  app.post('/users/add-active-quest/:questId', dbg, users.addActiveQuest);
  app.post('/users/add-quest/:questId', dbg, users.addQuest);
  app.post('/users/remove-quest/:questId', dbg, users.removeQuest);

  /* ----------- Quests ------------- */
  app.get('/quests', dbg, quests.index);
  app.get('/quests/new', dbg, quests.new);
  app.get('/quests/view', dbg, quests.view);
  app.get('/quests/quest-confirmation', dbg, quests.questConfirmation);
  app.get('/quests/class-confirmation', dbg, quests.upgradedClassConfirmation);
  app.get('/quests/class-quest-confirmation', dbg, quests.upgradedClassAndQuestConfirmation);
  app.get('/quests/show/:questId', dbg, quests.show);
  app.get('/quests/edit/:questId', dbg, quests.edit);
  app.post('/quests/create', dbg, quests.create);
  app.post('/quests/create-quest-map', dbg, quests.questMap);
  app.post('/quests/update/:questId', dbg, quests.updateQuest);


  /* ----------- Groups ------------- */
  app.get('/groups/new', dbg, groups.new);
  app.get('/groups/view', dbg, groups.view);
  app.get('/groups/show/:groupId', dbg, groups.show);
  app.get('/groups/edit/:groupId', dbg, groups.edit);
  app.post('/groups/leader-board', dbg, groups.leaderBoard);
  app.post('/groups/update-name', dbg, groups.updateName);
  app.post('/groups/update-description', dbg, groups.updateDescription);
  app.post('/groups/send-invitation', dbg, groups.sendInvitation);
  app.post('/groups/create', dbg, groups.create);
  app.post('/groups/remove-member', dbg, groups.removeMember);
  app.post('/groups/delete', dbg, groups.delete);
  app.post('/groups/join-group', dbg, groups.joinGroup);

  /* ----------- Search ------------- */
  app.get('/search', dbg, searches.getResults);

  console.log('Routes Loaded');
  fn();
}
