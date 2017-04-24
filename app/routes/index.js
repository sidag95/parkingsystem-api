var express = require('express');
var router = express.Router();
var parkingListController = require('../controllers/parkingListController')
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'thisIsSecretx',
  userProperty: 'payload'
});

router.get('/', parkingListController.getPakingLotsList);
router.get('/:lotId', parkingListController.getPakingLot);
router.post('/', auth, parkingListController.addPakingLot);
router.post('/book', auth, parkingListController.bookParkingSpace);
router.put('/:lotId', auth, parkingListController.updatePakingLot);

module.exports = router;
