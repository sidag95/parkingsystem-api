var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController')

/* GET users listing. */
router.get('/:userId', userController.userDetail);

router.post('/', userController.userDetail);

router.put('/:userId', userController.userDetail);

module.exports = router;
