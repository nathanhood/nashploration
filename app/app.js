'use strict';

var dbname = process.env.DBNAME || 'default-db';
var port = process.env.PORT || 4000;

var traceur        = require('traceur');
var express        = require('express');
var less           = require('express-less');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieSession  = require('cookie-session');
var flash          = require('connect-flash');
var initMongo      = traceur.require(__dirname + '/lib/init-mongo.js');
var initRoutes     = traceur.require(__dirname + '/lib/init-routes.js');

/* --- configuration    */
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/* --- pipeline         */
app.use(initMongo);
app.use(initRoutes);
app.use(morgan('dev', {}));
app.use(express.static(__dirname + '/static'));
app.use('/less', less(__dirname + '/less'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieSession({keys:['SEC123', '321CES']}));
app.use(flash());

/* --- http server      */
var server = require('http').createServer(app);
server.listen(port, function(){
  console.log('Node server listening. Port: ' + port + ', Database: ' + dbname);
});


module.exports = app;
