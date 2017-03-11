var mongoose = require('mongoose');
const PARKING_FREE = 'PARKING_FREE';
const PARKING_OCCUPIED = 'PARKING_OCCUPIED';
const PARKING_OUT_OF_SERVICE = 'PARKING_OUT_OF_SERVICE';
const PARKING_STATUS_ENUM = [PARKING_FREE, PARKING_OCCUPIED, PARKING_OUT_OF_SERVICE];

var parkingSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  spaces: [{
    _id: String,
    status: {
      type: String,
      // enum: PARKING_STATUS_ENUM,
      required: true,
    },
    reserved: String,
  }],
  location: {
    type: [Number],
    index: '2dsphere'
  }
}, {_id: false});

mongoose.model('ParkingLot', parkingSchema);
