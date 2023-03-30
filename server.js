//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

//..............Create an Express server object..................//
const session = require('express-session');
const passport = require('passport');
const { json } = require('express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;



const SESSION_SECRET = '---' // randomly generate

const app = express();
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  cookie: {
    maxAge : 1000 * 60 * 60 * 24 * 3 // 3 days duration
  } 
}));
app.use(passport.initialize());
app.use(passport.session());

//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(express.static('src')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

app.use(require('./controllers/index'));
app.use(require('./controllers/auth'));
app.use(require('./controllers/article_controller'));
app.use(require('./controllers/user_controller'));

app.use("", function(request, response) {
  response.redirect('/error?code=400');
});
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});