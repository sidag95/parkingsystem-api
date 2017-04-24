const mongoose = require('mongoose')
const User = mongoose.model('User')
const R = require('ramda')
const passport = require('passport')

const sendJsonResponse = require('../utils/sendJsonResponse').sendJsonResponse

const checkExistingUsername = function (req) {
  User
    .find({username: req.body.username})
    .then(function(response) {
      return response
    })
    .catch(function () {
      return null
    })
}

module.exports.getUser = function (req, res) {
  if(req.params.userId) {
    User
      .find({})
      .then(function (response) {
        sendJsonResponse(res, 200, response)
      })
      .catch(function (err) {
        sendJsonResponse(res, 400, err)
      })
  } else {
    sendJsonResponse(res, 500, {message: 'Bad request'})
  }
}

module.exports.getUsers = function (req, res) {
  User
    .find({})
    .then(function (response) {
      sendJsonResponse(res, 200, response)
    })
    .catch(function (err) {
      sendJsonResponse(res, 400, err)
    })
}

module.exports.checkUsername = function (req, res) {
  if (checkExistingUsername(req)) {
    sendJsonResponse(res, 400, {message: "Username already taken"})
  } else {
    sendJsonResponse(res, 200, {message: "Available"})
  }
}

module.exports.signUpUser = function (req, res) {
  const existingUsername = checkExistingUsername(req)
  if (!existingUsername) {
    User
      .findOne()
      .sort({_id : -1})
      .then(function(pL) {
        const nextId = pL ? parseInt(pL._id)+1 : 1
        const newUser = new User()
        newUser._id = nextId;
        newUser.name = req.body.name;
        newUser.username = req.body.username;
        newUser.setPassword(req.body.password)
        newUser
          .save()
          .then(function(response) {
            const token = newUser.generateJwt();
            sendJsonResponse(res, 200, {token: token})
          })
          .catch(function (err) {
            sendJsonResponse(res, 400, err)
          })
      })
      .catch(function(err) {
        sendJsonResponse(res, 400, err)
      })
  } else {
      sendJsonResponse(res, 500, {message: "Username already taken"})
    }
  }

  module.exports.loginUser = function(req, res) {
    passport.authenticate('local', function(err, user, info){
      var token;
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      if(user){
        token = user.generateJwt();
        sendJsonResponse(res, 200, {
          "token" : token
        });
      } else {
        sendJsonResponse(res, 401, info);
      }
    })(req, res);
  };

  module.exports.putUser = function (req, res) {
    User
      .findOne({_id: req.params.userId})
      .then(function (userDetails) {
        const updatedUserDetails = R.merge(userDetails.toJSON(), req.body)
        User.findOneAndUpdate({_id: req.params.userId}, updatedUserDetails)
          .then(function (response) {
            sendJsonResponse(res, 200, response)
          })
          .catch(function (error) {
            sendJsonResponse(res, 400, error)
          })
      })
      .catch(function (err) {
        sendJsonResponse(res, 404, err)
      })
  }
