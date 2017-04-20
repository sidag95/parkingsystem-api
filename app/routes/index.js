var express = require('express');
var router = express.Router();
var parkingListController = require('../controllers/parkingListController')

router.get('/', parkingListController.getPakingLotsList);
router.get('/:lotId', parkingListController.getPakingLot);
router.post('/', parkingListController.addPakingLot);
router.post('/book', parkingListController.bookParkingSpace);
router.put('/:lotId', parkingListController.updatePakingLot);

module.exports = router;
