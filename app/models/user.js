const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hash: String,
  salt: String,
  history: [{
    lotId: Number,
    spaceId: Number,
  }],
}, {_id: false});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({_id: this._id, name: this.name, exp: parseInt(expiry.getTime() / 1000)}, 'thisIsSecret');
};

mongoose.model('User', userSchema);
