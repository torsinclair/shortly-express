var http = require('http');
module.exports = function(request, response, next) {
  // console.log('request: ' + request.method + ' at ' + request.url);
  // console.log(request.url);
  console.log(request.session.sid);
  if (request.url !== '/login' && !request.session.sid) {
    response.redirect('/login');
  }
  next();
};