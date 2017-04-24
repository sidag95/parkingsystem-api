var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController')

router.get('/', userController.getUsers);
router.get('/:userId', userController.getUser);

router.post('/signup', userController.signUpUser);
router.post('/login', userController.loginUser);
router.post('/checkUsername', userController.checkUsername)

router.put('/:userId', userController.putUser);

module.exports = router;
