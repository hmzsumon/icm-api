const express = require('express');
const multer = require('multer');
const {
	newWithdrawRequest,
	myWithdraws,
	getWithdraw,
	allWithdraws,
	getWithdrawForAdmin,
	approveWithdraw,
	cancelWithdraw,
	updateAllowToWithdraw,
	rejectWithdraw,
} = require('../controllers/withdrawController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const upload = multer({});

// Create new withdraw request => /api/v1/withdraw/new
router.route('/new/withdraw').post(isAuthenticatedUser, newWithdrawRequest);

// Get my withdraws => /api/v1/withdraw/mywithdraws
router.route('/my-withdraws').get(isAuthenticatedUser, myWithdraws);

// Get a single withdraw => /api/v1/withdraw/:id
router.route('/withdraw/:id').get(isAuthenticatedUser, getWithdraw);

// Get all withdraws admin and manager
router
	.route('/admin/withdraws')
	.get(isAuthenticatedUser, authorizeRoles('admin', 'owner'), allWithdraws);

// Get single withdraw for admin and manager => /api/v1/admin/withdraw/:id
router
	.route('/admin/withdraw/:id')
	.get(
		isAuthenticatedUser,
		authorizeRoles('admin', 'owner'),
		getWithdrawForAdmin
	);

// Approve withdraw request => /api/v1/admin/withdraw/:id/approve
router
	.route('/withdraw/approve')
	.put(
		upload.none(),
		isAuthenticatedUser,
		authorizeRoles('admin', 'owner'),
		approveWithdraw
	);

// Cancel withdraw request => /api/v1/admin/withdraw/:id/cancel
router
	.route('/withdraw/cancel')
	.put(isAuthenticatedUser, authorizeRoles('admin', 'manager'), cancelWithdraw);

router
	.route('/update/allowToWithdraw')
	.put(isAuthenticatedUser, authorizeRoles('admin'), updateAllowToWithdraw);

// Reject withdraw request => /api/v1/admin/withdraw/:id/reject
router
	.route('/withdraw/reject')
	.put(
		upload.none(),
		isAuthenticatedUser,
		authorizeRoles('admin', 'owner'),
		rejectWithdraw
	);

module.exports = router;
