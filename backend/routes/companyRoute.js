const express = require('express');
const {
	createCompany,
	getCompanyAdmin,
	clearDailyWorkTodayWorkUsers,
	restCompany,
	getCompanyUserDemoCount,
} = require('../controllers/companyController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route('/company').post(createCompany);

router
	.route('/admin/company')
	.get(isAuthenticatedUser, authorizeRoles('admin', 'owner'), getCompanyAdmin);

router
	.route('/admin/company/clear-daily-work-today-work-users')
	.put(
		isAuthenticatedUser,
		authorizeRoles('admin'),
		clearDailyWorkTodayWorkUsers
	);

router.route('/user-demo-count').get(getCompanyUserDemoCount);

// rest company
router
	.route('/admin/company/reset')
	.put(isAuthenticatedUser, authorizeRoles('admin'), restCompany);

module.exports = router;
