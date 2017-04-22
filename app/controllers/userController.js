const mongoose = require('mongoose')
const User = mongoose.model('User')
const R = require('ramda')

const sendJsonResponse = require('../utils/sendJsonResponse')

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
    sendJsonResponse(res, 200, {message: {"Available"}})
  }
}

module.exports.signUpUser = function (req, res) {
  const newUser = new User(req.body)
  const existingUsername = checkExistingUsername(req)
  if (!existingUsername) {
    newUser
      .save()
      .then(function(response) {
        sendJsonResponse(res, 200, response)
      })
      .catch(function (err) {
        sendJsonResponse(res, 400, err)
      })
  } else {
    sendJsonResponse(res, 500, {message: "Username already taken"})
  }
}

module.exports.loginUser = function (req, res) {

}

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
