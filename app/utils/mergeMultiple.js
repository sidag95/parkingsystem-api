const R = require('ramda')

module.exports.mergeMultiple = function (originalObject) {
  var args = [].slice.call(arguments).slice(1);
  var updatedObject = originalObject;
  args.forEach(function(object){
    console.log("object", object)
    console.log("Semi update", updatedObject)
    updatedObject = R.merge(updatedObject, object)
    console.log("Half update", updatedObject)
  })
  console.log("updated ",updatedObject)
  return updatedObject
}
