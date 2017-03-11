var express = require('express');
var router = express.Router();
var parkingListController = require('../controllers/parkingListController')

router.get('/parking', parkingListController.getPakingLotsList);
router.get('/parking/:lotId', parkingListController.getPakingLot);
router.post('/parking', parkingListController.addPakingLot);
router.put('/parking/:lotId', parkingListController.updatePakingLot);

module.exports = router;
