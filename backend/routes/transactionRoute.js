const express = require('express');
const {
	getUserTransactions,
	sendMoney,
	getLoginUserTransactions,
} = require('../controllers/transactionController');
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/transaction/me').get(isAuthenticatedUser, getUserTransactions);

router.route('/send-money').post(isAuthenticatedUser, sendMoney);

// login user transactions
router
	.route('/my/transactions')
	.get(isAuthenticatedUser, getLoginUserTransactions);

module.exports = router;
