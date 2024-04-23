const express = require('express');
const multer = require('multer');
const {
	seedUser,
	registerUser,
	verifyEmail,
	resendEmailVerification,
	getUserByPartnerId,
	checkEmailExist,
	loginUser,
	logout,
	loadUser,
	userAddress,
} = require('../controllers/userController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();
const upload = multer({});

// seed user
router.route('/seed_users').post(seedUser);

// register user
router.route('/register').post(registerUser);

// verify email
router.route('/verify-email').post(verifyEmail);

// resend email verification
router.route('/resend-email-verification').post(resendEmailVerification);

// get user by partner id
router.route('/get-user-by-partner-id/:id').get(getUserByPartnerId);

// check email exist
router.route('/check-email-exist').post(checkEmailExist);

// login user
router.route('/login').post(loginUser);

// logout user
router.route('/logout').post(isAuthenticatedUser, logout);

// load user
router.route('/load-user').get(isAuthenticatedUser, loadUser);

// user address
router.route('/my-address').get(isAuthenticatedUser, userAddress);
module.exports = router;
