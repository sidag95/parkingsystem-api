module.exports.composeParkingLot = function (parkingLot, spaceId, updatedParkingSpace) {
  return R.merge(parkingLot, parkingLot.spaces.map(function(space) {
    if (space._id === spaceId) {
      return updatedParkingSpace
    }
    return space
  }))
}