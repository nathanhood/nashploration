'use strict';

var Cookies = require('cookies');

exports.connection = function(socket){
  addUserToSocket(socket);
};

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

function addUserToSocket(socket){
  var cookies = new Cookies(socket.handshake, {}, ['SEC123', '321CES']);
  var encoded = cookies.get('express:sess');
  var decoded;

  if(encoded){
    decoded = decode(encoded);
  }

  // 1. Find user in DB
  // 2. Add user to socket
  // 3. Inform the user they are online

  // EXAMPLE CODE

  // User.findByUserId(obj.userId, user=>{
  //   socket.set('user', user, ()=>{
  //     socket.emit('online');
  //   });
  // });

  console.log(decoded);
}

function decode(string) {
  var body = new Buffer(string, 'base64').toString('utf8');
  return JSON.parse(body);
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
