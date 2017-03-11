var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');


var dbUri = 'mongodb://siddhant:letmein@ds123400.mlab.com:23400/parkingsystem'
mongoose.connect(dbUri);

var gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose connection closed through '+msg);
    callback();
  });
};

mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to '+dbUri);
})

mongoose.connection.on('error', function() {
  console.log('Mongoose connection error '+dbUri);
})

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected '+dbUri);
})

// For nodemon restarts
process.once('SIGUSR2', function () {
gracefulShutdown('nodemon restart', function () {
process.kill(process.pid, 'SIGUSR2');
});
});
// For app termination
process.on('SIGINT', function() {
gracefulShutdown('app termination', function () {
process.exit(0);
});
});
// For Heroku app termination
process.on('SIGTERM', function() {
gracefulShutdown('Heroku app shutdown', function () {
process.exit(0);
});
});

require('./parking')
