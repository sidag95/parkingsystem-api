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
  ParkingLot.findOne({_id: req.params.lotId})
  .then(function(pL) {
    const pLJSON = pL.toJSON();
    const updatedSpaces = pLJSON.spaces.map(function(pLS) {
      const _id = pLS._id;
      const matchingSpace = R.find(R.propEq('_id', _id))(req.body.spaces);
      if(matchingSpace) {
        return R.merge(pLS, matchingSpace);
      }
      else {
        return pLS;
      }
    })
    const updatedPL = R.merge(pLJSON, {spaces: updatedSpaces});
    ParkingLot.findOneAndUpdate({_id: req.params.lotId}, updatedPL)
    .then(function(doc) {
      sendJsonResponse(res, 203, doc); 
    })
    .catch(function(err) {
      sendJsonResponse(res, 500, err)
    })
  })
  .catch(function(err) {
    sendJsonResponse(res, 503, {'status' : err})
  })
}