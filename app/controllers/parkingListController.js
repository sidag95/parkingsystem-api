const mongoose = require('mongoose')
const ParkingLot = mongoose.model('ParkingLot')
const R = require('ramda')

const sendJsonResponse = function(res, status, content) {
res.status(status);
res.json(content);
};

module.exports.getPakingLotsList = function (req, res) {
  ParkingLot.find({}, function(err, list) {
    if(err) {
      return sendJsonResponse(res, 400, {'status' : err});

    }
    sendJsonResponse(res, 200, list);
  })
}

module.exports.getPakingLot = function(req, res) {
  ParkingLot
  .findOne({_id: req.params.lotId})
  .then(function(lot) {
    sendJsonResponse(res, 200, lot)
  })
  .catch(function(err) {
    sendJsonResponse(res, 400, err)
  })
}

module.exports.addPakingLot = function (req, res) {
  ParkingLot
  .findOne()
  .sort({_id : -1})
  .then(function(pL) {
    const nextId = pL ? parseInt(pL._id)+1 : 1

  const newParkingLot = new ParkingLot(
    R.mergeAll([req.body, {_id: nextId}]))
  newParkingLot
  .save().then(function(err, list) {
    sendJsonResponse(res, 201, {'status' : list});
  })
  .catch(function(err) {
    sendJsonResponse(res, 400, {'status' : err});
  })
})
}


module.exports.updatePakingLot = function (req, res) {
  ParkingLot.findOneAndUpdate({_id: req.params.lotId}, req.body)
  .then(function(pL) {
    sendJsonResponse(res, 200, pL);
  })
  .catch(function(err) {
    sendJsonResponse(res, 404, err)
  })
}
