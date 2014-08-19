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
//
// exports.getLocations = (req, res)=>{
//   var allLocations = {};
//   Location.findAll(locations=>{
//     if(res.locals.user.checkIns){
//       Location.findManyById(res.locals.user.checkIns, allCheckIns=>{
//         if(res.locals.user.activeQuest.questId){
//           Quest.findById(res.locals.user.activeQuest.questId, (err, quest)=>{
//             Location.removeDuplicates(locations, allCheckIns, allMinusCheckIns=>{
//               if(quest.checkIns.length === res.locals.user.activeQuest.questLocs.length){
//                 allLocations.all = allMinusCheckIns;
//                 allLocations.quest = null;
//                 allLocations.checkIns = allCheckIns;
//                   res.send(allLocations);
//               }else{
//                 Location.findActiveQuestLocations(quest.checkIns, res.locals.user.activeQuest.questLocs, (questLocs)=>{
//                   Location.removeDuplicates(allMinusCheckIns, questLocs, allMinusDups=>{
//                     Location.removeDuplicates(allCheckIns, questLocs, allCheckInsMinusDups=>{
//                       allLocations.all = allMinusDups;
//                       allLocations.quest = questLocs;
//                       allLocations.checkIns = allCheckInsMinusDups;
//                         res.send(allLocations);
//                     });
//                   });
//                 });
//               }
//             });
//           });
//         }else{
//           allLocations.all = locations;
//           allLocations.quest = null;
//           res.send(allLocations);
//         }
//       });
//     }else{
//       allLocations.all = locations;
//       allLocations.quest = null;
//       res.send(allLocations);
//     }
//   });
// };

exports.getLocations = (req, res)=>{
  var locationsObj = {};

  if(res.locals.user.checkIns.length && res.locals.user.activeQuest.questId){
    Location.findAll(locations=>{
      Location.findManyById(res.locals.user.checkIns, allCheckIns=>{
        Quest.findById(res.locals.user.activeQuest.questId, (err, quest)=>{
          Location.removeDuplicates(locations, allCheckIns, allMinusCheckIns=>{
            if(quest.checkIns.length === res.locals.user.activeQuest.questLocs.length){
              locationsObj.all = allMinusCheckIns;
              locationsObj.quest = null;
              locationsObj.checkIns = allCheckIns;
                res.send(locationsObj);
            }else{
              Location.findActiveQuestLocations(quest.checkIns, res.locals.user.activeQuest.questLocs, (questLocs)=>{
                Location.removeDuplicates(allMinusCheckIns, questLocs, allMinusDups=>{
                  Location.removeDuplicates(allCheckIns, questLocs, allCheckInsMinusDups=>{
                    locationsObj.all = allMinusDups;
                    locationsObj.quest = questLocs;
                    locationsObj.checkIns = allCheckInsMinusDups;
                      res.send(locationsObj);
                  });
                });
              });
            }
          });
        });
      });
    });
  }else if(res.locals.user.activeQuest.questId && res.locals.user.checkIns.length < 1){
    Location.findAll(locations=>{
      Quest.findById(res.locals.user.activeQuest.questId, (err, quest)=>{
        if(quest.checkIns.length === res.locals.user.activeQuest.questLocs.length){
          locationsObj.all = locations;
          locationsObj.quest = null;
          locationsObj.checkIns = null;
            res.send(locationsObj);
        }else{
          Location.findActiveQuestLocations(quest.checkIns, res.locals.user.activeQuest.questLocs, (questLocs)=>{
            Location.removeDuplicates(locations, questLocs, allMinusDups=>{
              locationsObj.all = allMinusDups;
              locationsObj.quest = questLocs;
              locationsObj.checkIns = null;
                res.send(locationsObj);
            });
          });
        }
      });
    });
  }else if(!res.locals.user.activeQuest.questId && res.locals.user.checkIns){
    Location.findAll(locations=>{
      Location.findManyById(res.locals.user.checkIns, allCheckIns=>{
        Location.removeDuplicates(locations, allCheckIns, allMinusCheckIns=>{
          locationsObj.all = allMinusCheckIns;
          locationsObj.quest = null;
          locationsObj.checkIns = allCheckIns;
            res.send(locationsObj);
        });
      });
    });
  }else{
    Location.findAll(locations=>{
      locationsObj.all = locations;
      locationsObj.quest = null;
      locationsObj.checkIns = null;
        res.send(locationsObj);
    });
  }
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
