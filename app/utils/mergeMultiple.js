const R = require('ramda')

module.exports.mergeMultiple = function (originalObject) {
  var args = [].slice.call(arguments).slice(1);
  var updatedObject = originalObject;
  args.forEach(function(object){
    updatedObject = R.merge(updatedObject, object)
  })
  return updatedObject
}
