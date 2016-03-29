var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
// var expressSession = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// if they aren't logged in, redirect to login, otherwise
// render index with access to a
app.get('/', 
function(req, res) {
  // res.render('index');
  res.redirect('/login');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  // If user isn't logged and tries creating a link
  // Redirect to login
  if (!util.isValidUrl(uri)) {
      

    console.log('Not a valid url: ', uri);
    return res.status(404).send('Not a valid url');
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.status(404).send('Error reading URL heading');
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// signup [post/signup]
app.post('/signup', function(req, res) {
  new User({username: req.body.username, password: req.body.password})
  .save()
  .then(function(model) {
    res.redirect('/create');
  });

});

// login
// Todo: if the password matches given a username, log in
app.post('/login', function(req, res) {
  new User({username: req.body.username})
  .fetch()
  .then(function(found) {
    //logic that checks db
    console.log(found);
  });
  // end response
});


// Todos:
// When we sign up --- log a person in -- give them some token/session id/cookie
// when they log in within some period of time, give them a token/session id/cookie

// know about each user's token, store it somewhere

// write a function that tests whether a user is logged in

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
