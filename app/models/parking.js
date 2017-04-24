var mongoose = require('mongoose');
const PARKING_FREE = 'PARKING_FREE';
const PARKING_OCCUPIED = 'PARKING_OCCUPIED';
const PARKING_OUT_OF_SERVICE = 'PARKING_OUT_OF_SERVICE';
const PARKING_RESERVED = 'PARKING_RESERVED'
const PARKING_BOOKED = 'PARKING_BOOKED'
const PARKING_STATUS_ENUM = [
  PARKING_FREE,
  PARKING_OCCUPIED,
  PARKING_BOOKED,
  PARKING_RESERVED,
  PARKING_OUT_OF_SERVICE
];

const parkingSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  spaces: [{
    _id: String,
    status: {
      type: String,
      required: true,
      enum: PARKING_STATUS_ENUM,
    },
    reserved: {
      user: String,
      validTill: Number,
    },
    booked: {
      user: String,
      validTill: Number,
    },
    dimensions: {
      xCord: String,
      yCord: String,
    },
    bookingRequests: [String],
  }],
  location: {
    type: [Number],
    index: '2dsphere'
  }
}, {_id: false});

mongoose.model('ParkingLot', parkingSchema);
