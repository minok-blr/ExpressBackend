var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var multer = require('multer');
var upload = multer({dest: 'public/images/'});


router.get('/', userController.list);
router.get('/register', userController.showRegister);
router.get('/login', userController.showLogin);
router.get('/profile', userController.profile);
router.get('/logout', userController.logout);
router.get('/publish', userController.publish);
router.get('/:id', userController.show);


router.post('/', userController.create);
router.post('/login', userController.login);

router.put('/:id', upload.single('image'), userController.update);

router.delete('/:id', userController.remove);

module.exports = router;
