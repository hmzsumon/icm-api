const express = require('express');
const multer = require('multer');
const router = express.Router();
const { newConvert, sendMoney } = require('../controllers/convertController');
const upload = multer({});
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// new convert
router
	.route('/new-convert')
	.post(upload.none(), isAuthenticatedUser, newConvert);

// send money
router.route('/send-money').post(upload.none(), isAuthenticatedUser, sendMoney);

module.exports = router;
