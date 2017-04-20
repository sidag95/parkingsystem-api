var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
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
});

mongoose.model('User', userSchema);
