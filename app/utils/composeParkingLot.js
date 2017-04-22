const R = require('ramda')

module.exports.composeParkingLot = function (parkingLot, spaceId, updatedParkingSpace) {
  return R.merge(parkingLot, {spaces: parkingLot.spaces.map(function(space) {
    console.log("Space", space)
    if (space._id === spaceId) {
      console.log(updatedParkingSpace)
      return updatedParkingSpace
    }
    return space
  })})
}