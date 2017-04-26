var express = require('express');
var router = express.Router();
var parkingListController = require('../controllers/parkingListController')
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'thisIsSecret',
  requestProperty: 'auth'
});

router.get('/', parkingListController.getPakingLotsList);
router.get('/:lotId', parkingListController.getPakingLot);
router.post('/', parkingListController.addPakingLot);
router.post('/book', auth, parkingListController.bookParkingSpace);
router.put('/:lotId', parkingListController.updatePakingLot);

module.exports = router;
