/* jshint unused:false, camelcase:false */

'use strict';

var traceur = require('traceur');
var Location = traceur.require(__dirname + '/../models/location.js');
var Quest = traceur.require(__dirname + '/../models/quest.js');



exports.addHistory = (req, res)=>{
  // get historical markers
  Location.addHistory((bodyLength)=>{
    res.send('got ' + bodyLength + ' historical objects');
  });
};

exports.index = (req, res)=>{
  res.render('locations/index');
};


exports.getLocations = (req, res)=>{
  var allLocations = {};
  Location.findAll((locations)=>{ //finds all locations
    if(res.locals.user){
      Location.findManyById(res.locals.user.checkIns, allCheckIns=>{ //finds locations that have been completed in user's Active Quest
        Quest.findById(res.locals.user.activeQuest.questId, (err, quest)=>{ //finds users's Active Quest
          Location.removeDuplicates(locations, allCheckIns, allMinusCheckIns=>{
        if(quest.checkIns.length === res.locals.user.activeQuest.questLocs.length){ //checks if active quest is complete
            allLocations.all = allMinusCheckIns;
            allLocations.quest = null;
            allLocations.checkIns = allCheckIns;
              res.send(allLocations);
        }else{
          Location.findActiveQuestLocations(quest.checkIns, res.locals.user.activeQuest.questLocs, (questLocs)=>{ //finds all locations in the active quest. brings back array of all checkins in quest and completed checkins by user
            Location.removeDuplicates(allMinusCheckIns, questLocs, allMinusDups=>{ //removes
              Location.removeDuplicates(allCheckIns, questLocs, allCheckInsMinusDups=>{
                allLocations.all = allMinusDups;
                allLocations.quest = questLocs;
                allLocations.checkIns = allCheckInsMinusDups;
                res.send(allLocations);
              });
            });
          });
         }
        });
       });
      });
    }else{
      allLocations.all = locations;
      allLocations.quest = null;
      res.send(allLocations);
   }
  });
};

exports.getCivilWarLocations = (req, res)=>{
  Location.filterCivilWarLocations((locations)=>{
    res.send(locations);
  });
};

exports.getAndrewJacksonLocations = (req, res)=>{
  Location.filterAndrewJacksonLocations((locations)=>{
    res.send(locations);
  });
};


exports.locationDetails = (req, res)=>{
  Location.findCoordinates(req.params, location=>{
    res.render('locations/detail', {title: `${location.name}`, location: location});
  });
};

exports.findCloseLocs = (req, res)=>{
  Location.radialSearch(req.params, locations=>{
    res.send(locations);
  });
};

exports.resetLocations = (req, res)=>{
  var closeLocs = req.params.closeLocations.split(',');
    Location.resetCloseLocations(closeLocs, locations=>{
      res.send(locations);
    });
};


exports.getActiveQuestLocations = (req, res)=>{
  Quest.findById(res.locals.user.activeQuest.questId, (err, quest)=>{
    if(quest.checkIns.length === res.locals.user.activeQuest.questLocs.length){
      res.send(null);
    }else{
    Location.findActiveQuestLocations(quest.checkIns, res.locals.user.activeQuest.questLocs, (locations)=>{
      res.send(locations);
    });
   }
  });
};
