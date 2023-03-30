const express = require('express'), app = express.Router()
const ArticleModel = require('../models/article_model.js'), UserModel = require('../models/user_model.js')
const session = require('express-session');
const passport = require('passport');
const { json } = require('express');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys =require('../config/keys.json')
const GOOGLE_CLIENT_ID = keys.GOOGLE_CLIENT_ID , GOOGLE_CLIENT_SECRET = keys.GOOGLE_CLIENT_SECRET


passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile.id);
}
));

passport.serializeUser(function(userID, done) {
  done(null, userID);
});

passport.deserializeUser(function(userID, done) {
  done(null, userID)
});
app.get('/auth/google', passport.authenticate('google', { scope : ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error?code=400' }),
  function(req, res) {
    try{
      const id = req.session.passport.user
      if(UserModel.isValidUser(id)){
        
        res.redirect('/articles')
      }else{
        console.log('hello')
        res.redirect('/users/new')
      }
    }catch{
      res.redirect('/error?code=400')
    }
  });

  app.get('/logout', isLogged, (req,res)=>{
    req.session.destroy()
    res.render('logout')
  })
  function isLogged(req, res, next){
    try{
      const id = req.session.passport.user
      if(UserModel.isValidUser(id)){
        next()
        return
      }else{
        res.redirect('/error?code=401')
        throw 'Not logged in. Access not granted.'
      }
    }catch{
      res.redirect('/error?code=401')
      throw 'Not logged in. Access not granted.'
    }
  }

  module.exports = app