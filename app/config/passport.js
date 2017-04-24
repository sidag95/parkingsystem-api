var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({},
  function(username, password, done) {
    User
      .findOne({ username: username })
      .then(function(user) {
        if(!user) {
          return done(null, false, {message: 'Incorrect username'})
        }
        if (!user.validPassword(password)) {
          return done(null, false, {message: 'Incorrect password'})
        }
        return done(null, user)
      })
      .catch(function (err) {
        return done(err)
      })
  }));