const express = require('express');
const multer = require('multer');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
	adminLogin,
	addMoneyFromAdmin,
	deductMoneyFromAdmin,
	getAllUsers,
} = require('../controllers/adminController');

router.route('/admin/login').post(adminLogin);

router
	.route('/admin/add_money')
	.post(isAuthenticatedUser, authorizeRoles('admin'), addMoneyFromAdmin);

router
	.route('/admin/deduct_money')
	.put(isAuthenticatedUser, authorizeRoles('admin'), deductMoneyFromAdmin);

// get all users
router.route('/users').get(getAllUsers);

module.exports = router;
