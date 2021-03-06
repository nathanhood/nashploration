# Nashploration
BADGES
[![Build Status](https://travis-ci.org/nathanhood/nashploration.svg?branch=master)](https://travis-ci.org/nathanhood/nashploration)
[![Dependency Status](https://gemnasium.com/nathanhood/bandPortal.png)](https://gemnasium.com/nathanhood/nashploration)

An interactive web application, inviting kids to engage with Nashville's local
history and community.

### Accounts needed for development
- Mailgun (http://www.mailgun.com/)

## Installation
1. Install MongoDB (http://docs.mongodb.org/manual/installation/)
  - `mongod`
2. Launch instance of MongoDB locally
3. Install Node.js (http://nodejs.org/download/)
4. Clone Github repository
  - `git clone https://github.com/nathanhood/nashploration`
5. Inside newly created project directory:
  - `npm install`
6. Launch node server
  - `PORT=3000 DBNAME=nashploration node app/app.js`
7. Import locations from data.nashville.gov
  - `curl -X POST http://localhost:3000/addHistory`
  - This will create a 'locations' collection in your 'nashploration' db
  - This can be viewed by opening the mongo shell in your terminal or by downloading robomongo (mongodb visual data manager)
8. Add Wikipedia data for locations to database
  - In terminal: `mongoimport --db nashploration --collection wikilinks --file db/wiki.json --jsonArray`
8. You should now be ready to begin:
  - Kill current node server that is running `ctrl+c`
  - Start server with Mailgun key
    - `PORT=3000 DBNAME=nashploration MAILGUN='your_key' node app/app.js`
Note: You can still develop without a Mailgun account as long as development does not pertain
to anything regarding emails.


### Technologies Used
- Node.js
- Express
- MongoDB
- Traceur
- Jade
- Less
- Google Maps
- Media Wiki
- Mailgun
