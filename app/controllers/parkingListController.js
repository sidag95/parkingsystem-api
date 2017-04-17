const mongoose = require('mongoose')
const ParkingLot = mongoose.model('ParkingLot')
const R = require('ramda')

const sseHelpers = require('../utils/sseHelper')
const setSSEHeaders = sseHelpers.setSSEHeader
const constructSSE = sseHelpers.constructSSE

const sendJsonResponse = function(res, status, content) {
res.status(status);
res.json(content);
};

function pollDBToConstructSSE (res, data) {
  return ParkingLot
    .find({})
    .then(function(lotData) {
      console.log(JSON.stringify(lotData) === JSON.stringify(data))
      if(JSON.stringify(lotData) !== JSON.stringify(data)) {
        constructSSE(res, 200, lotData)
      }
      return lotData
    })
    .catch(function(err) {
      console.log(err)
      constructSSE(res, 400, err)
      return data
    })
}

module.exports.getPakingLotsList = function (req, res) {
  if (req.headers.accept && req.headers.accept === 'text/event-stream') {
    var data=[];
    setSSEHeaders(res)
      const pollDB = function () {
      pollDBToConstructSSE(res, data)
        .then(function (resData) {
          data=resData
        })
      setTimeout(pollDB, 2000)
    }
    pollDB()
  } else {
    ParkingLot
      .find({})
      .then(function(lot) {
        sendJsonResponse(res, 200, lot)
      })
      .catch(function(err) {
        sendJsonResponse(res, 400, err)
      })
  }
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