#!/bin/sh

mongoimport --db nashploration-test --collection quests --file db/quest.json --jsonArray
