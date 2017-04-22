var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  history: [{
    lotId: Number,
    spaceId: Number,
  }],
}, {_id: false});

mongoose.model('User', userSchema);
