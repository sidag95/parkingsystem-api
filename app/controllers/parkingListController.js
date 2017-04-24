const mongoose = require('mongoose')
const ParkingLot = mongoose.model('ParkingLot')
const R = require('ramda')

const sendJsonResponse = require('../utils/sendJsonResponse').sendJsonResponse
const composeParkingLot = require('../utils/composeParkingLot').composeParkingLot
const mergeMultiple = require('../utils/mergeMultiple').mergeMultiple
const sseHelpers = require('../utils/sseHelper')
const setSSEHeaders = sseHelpers.setSSEHeader
const constructSSE = sseHelpers.constructSSE

const bookedEmpty = {
  user: '',
  validTill: 0,
}

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
          if(matchingSpace.status === 'PARKING_FREE') {
            if(pLS.booked && !R.isEmpty(pLS.booked.user)) {
              const currentMillis = new Date().getTime()
              if(currentMillis > pLS.booked.validTill) {
                return mergeMultiple(pLS, matchingSpace, {booked: bookedEmpty});
              }
              else {
                const booked = pLS.booked
                return mergeMultiple(pLS, matchingSpace, {booked: booked}, {status: 'PARKING_BOOKED'})
              }
            }
            if (pLS.reserved && !R.isEmpty(pLS.reserved.user)) {
              const currentMillis = new Date().getTime()
              if(currentMillis > pLS.reserved.validTill) {
                return mergeMultiple(pLS, matchingSpace, {booked: bookedEmpty});
              }
              else {
                const reserved = pLS.reserved
                return mergeMultiple(pLS, matchingSpace, {reserved: reserved}, {status: 'PARKING_RESERVED'})
              }
            }
          }
          return R.merge(pLS, matchingSpace);
        }
        else {
          return pLS;
        }
      })
      const updatedParkingSpaces = R.isEmpty(updatedSpaces) ? req.body.spaces : updatedSpaces
      const location = req.body.location ? req.body.location : pLJSON.location
      const name = req.body.name ? req.body.name : pLJSON.name
      const updatedPL = mergeMultiple(pLJSON, {spaces: updatedParkingSpaces}, {location: location}, {name: name});
      ParkingLot.findOneAndUpdate({_id: req.params.lotId}, updatedPL)
        .then(function(doc) {
          sendJsonResponse(res, 203, doc);
        })
        .catch(function(err) {
          sendJsonResponse(res, 500, err)
        })
    })
    .catch(function(err) {
      console.log(err)
      sendJsonResponse(res, 503, err)
    })
}

module.exports.bookParkingSpace = function (req, res) {
  const lotId = req.body.lotId;
  const spaceId = req.body.spaceId;
  const userId = req.body.userId;

  ParkingLot
    .findOne({_id: lotId})
    .then(function (doc) {
      const parkingLot = doc.toJSON();
      const parkingSpace = parkingLot.spaces.filter(function (f) {
        return f._id === spaceId;
      })[0]
      if(parkingSpace.status === 'PARKING_FREE') {
        const bookingRequests = R.append(userId, parkingSpace.bookingRequests)
        const updatedParkingSpace = R.merge(parkingSpace, {bookingRequests: bookingRequests})
        const updatedParkingLot = composeParkingLot(parkingLot, spaceId, updatedParkingSpace)
        ParkingLot
          .findOneAndUpdate({_id:lotId}, updatedParkingLot)
          .then(function() {
            ParkingLot
              .findOne({_id: lotId})
              .then(function(lot){
                const pLot = lot.toJSON()
                const pSpace = pLot.spaces.filter(function(f){
                  return f._id === spaceId
                })[0]
                if (pSpace.status === 'PARKING_FREE' && (pSpace.bookingRequests.length > 0)) {
                  const bookerId = pSpace.bookingRequests[0]
                  const bookingReq = []
                  const validTill = new Date().getTime() + (20*60*1000)
                  console.log("Time ------------", validTill)
                  const booked = {
                    user: bookerId,
                    validTill: validTill,
                  }
                  const updatedPSpace = mergeMultiple(pSpace,
                    {bookingRequests: bookingReq},
                    {booked: booked},
                    {status: "PARKING_BOOKED"}
                  )
                  const updatedPLot = composeParkingLot(pLot, spaceId, updatedPSpace)
                  ParkingLot
                    .findOneAndUpdate({_id: lotId}, updatedPLot)
                    .then(function(document) {
                      sendJsonResponse(res, 200, document)
                    })
                    .catch(function(err) {
                      sendJsonResponse(res, 400, err)
                    })
                } else {
                  sendJsonResponse(res, 400, {message: "Parking Space not free"})
                }
              })
          })
          .catch(function (err) {
            sendJsonResponse(res, 400, err)
          })
      } else {
        sendJsonResponse(res, 400, {message: "Parking Space not free"})
      }
    })
    .catch(function (err) {
      sendJsonResponse(res, 400, err)
    })
}
