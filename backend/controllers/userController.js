const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const SendRecord = require('../models/sendRecord');
const SubscriptionRecord = require('../models/subscriptionRecord');
const WithdrawRecord = require('../models/withdrawRecord');
const DepositRecord = require('../models/depositRecord');
const TreeNode = require('../models/TreeNode');
const Team = require('../models/teamModel');
const sendToken = require('../utils/jwtToken');
const { sendEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const createTransaction = require('../utils/tnx');
const ip = require('ip');
const Mining = require('../models/miningModel');
const registrationTemplate = require('../utils/templateR');
const securityTemplate = require('../utils/templateS');
const Transaction = require('../models/transaction');
const UserNotification = require('../models/userNotification');
const RankRecord = require('../models/rankRecord');
const { generateUniqueId } = require('../lib/functions');
const cron = require('node-cron');
const Wallet = require('../models/walletModel');
const Address = require('../models/addressModel');
//======================================
//seed user => /api/v1/seed/user
//======================================

exports.seedUser = catchAsyncErrors(async (req, res, next) => {
	const partner_id = await generateUniqueId();
	// create user
	const user = await User.create({
		name: 'IC Market01',
		email: 'icmuser241@gmail.com',
		phone: '01757454532',
		country: 'Bangladesh',
		password: 'Su112200@',
		text_password: 'Su112200@',
		role: 'user',
		position: 1,
		partner_id,
		is_active: true,
		email_verified: true,
		owner_id: '65f86a8fafbc580ebc0b53cb',
		owner_name: 'Owner-02',
	});

	// create wallet
	await Wallet.create({
		user_id: user._id,
		partner_id: user.partner_id,
	});

	// create withdraw record
	await WithdrawRecord.create({
		user_id: user._id,
		partner_id: user.partner_id,
	});

	// create deposit record
	await DepositRecord.create({
		user_id: user._id,
		partner_id: user.partner_id,
	});

	// create team
	await Team.create({
		user_id: user._id,
		partner_id: user.partner_id,
	});

	// SendRecord
	await SendRecord.create({
		user_id: user._id,
		partner_id: user.partner_id,
	});

	let parentNode = await TreeNode.findOne({
		$or: [{ left: null }, { right: null }],
	});

	let newNode;
	if (!parentNode) {
		newNode = await TreeNode.create({
			value: user._id,
			name: user.name,
		});
	} else {
		if (!parentNode.left) {
			newNode = await TreeNode.create({
				value: user._id,
				parent: parentNode._id,
				name: user.name,
			});
			parentNode.left = newNode._id;
		} else {
			newNode = await TreeNode.create({
				value: user._id,
				parent: parentNode._id,
				name: user.name,
			});
			parentNode.right = newNode._id;
		}
		await parentNode.save();
	}

	res.status(200).json({
		success: true,
		message: 'User created successfully',
	});
});

//======================================
// Register a user => /api/v1/register
//======================================

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
	const {
		country,
		name,
		email,
		mobile,
		partnerCode: referral,
		dateOfBirth,
		address,
		city,
		state,
		zip,
		password,
		passCode,
	} = req.body;

	// find company
	const company = await Company.findOne();

	// check if user already exists by email
	const existUser = await User.findOne({ email });

	if (existUser) {
		return next(new ErrorHandler('User already exists', 404));
	}

	// find sponsor by customer_id
	const sponsor = await User.findOne({ partner_id: referral });
	if (!sponsor) {
		return next(new ErrorHandler('Sponsor not found', 404));
	}

	// find Sponsor team
	const sponsorTeam = await Team.findOne({ user_id: sponsor._id });
	if (!sponsorTeam) {
		return next(new ErrorHandler('Sponsor team not found', 404));
	}

	// find owner by sponsor owner_id
	const owner = await User.findById(sponsor.owner_id);
	if (!owner) {
		return next(new ErrorHandler('Owner not found', 404));
	}

	const usersLength = await User.countDocuments({ role: 'user' });

	// 9 digit customer id
	const partner_id = await generateUniqueId();

	// 6 digit verification code
	const verify_code = Math.floor(100000 + Math.random() * 900000);

	const user = await User.create({
		name: name,
		email,
		mobile,
		dateOfBirth,
		country,
		passCode,
		password,
		text_password: password,
		position: usersLength + 1,
		partner_id,
		sponsor: {
			user_id: sponsor._id,
			name: sponsor.name,
		},
		parents: [sponsor._id].concat(sponsor.parents.slice(0, 11)),
		verify_code,
		owner_id: owner._id,
		owner_name: owner.name,
	});

	// create address
	await Address.create({
		user_id: user._id,
		partner_id: user.partner_id,
		address,
		city,
		state,
		zip,
		country,
	});

	// create wallet
	await Wallet.create({
		user_id: user._id,
		partner_id: user.partner_id,
	});

	// create withdraw record
	await WithdrawRecord.create({
		user_id: user._id,
		partner_id: user.partner_id,
		name: user.name,
	});

	// create deposit record
	await DepositRecord.create({
		user_id: user._id,
		partner_id: user.partner_id,
		name: user.name,
	});

	// create team
	await Team.create({
		user_id: user._id,
		partner_id: user.partner_id,
		name: user.name,
	});

	// SendRecord
	await SendRecord.create({
		user_id: user._id,
		partner_id: user.partner_id,
		name: user.name,
	});

	// Add the new user to the sponsor's team at level 1
	sponsorTeam.level_1.users.push(user._id);
	await sponsorTeam.save();

	let currentLevel = 2; // Start from level 2 since we already updated the sponsor's team for level 1
	for (let parentId of user.parents.slice(1)) {
		// We skip the first parent since it's the sponsor
		const parentTeam = await Team.findOne({ user_id: parentId });
		if (parentTeam) {
			let levelProp = 'level_' + currentLevel; // generate the property name dynamically
			if (parentTeam[levelProp]) {
				parentTeam[levelProp].users.push(user._id);
				await parentTeam.save();
			}
		}
		currentLevel++;
	}

	if (sponsor) {
		sponsor.children.push(user._id);
		await sponsor.save();

		// Update user's parents
		for (let parentId of user.parents) {
			const parent = await User.findById(parentId);
			if (!parent.children.includes(user._id)) {
				parent.children.push(user._id);
				await parent.save();
			}
		}
	}

	// update company
	company.users.total_users += 1;
	await company.save();

	const html = registrationTemplate(user.name, verify_code);

	// send verify code to user email
	sendEmail({
		email: user.email,
		subject: 'Verification Code',
		html: html,
	});

	res.status(201).json({
		success: true,
		message: 'User registered successfully',
	});
});

//======================================
// Email verification => /api/v1/verify
//======================================
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
	const { verificationCode: code, email } = req.body;

	// check code and email validation
	if (!code || !email) {
		return next(new ErrorHandler('Invalid code or email', 400));
	}

	// console.log(req.body);
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	if (user.verify_code !== code) {
		return next(new ErrorHandler('Invalid code', 400));
	}

	// update user
	user.email_verified = true;
	user.verify_code = null;
	await user.save();

	res.status(200).json({
		success: true,
		message: 'Email verified successfully',
	});
});

//======================================
// Resend Email verification
//======================================
exports.resendEmailVerification = catchAsyncErrors(async (req, res, next) => {
	const { email } = req.body;
	console.log(email);
	const user = await User.findOne({ email });

	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// generate verify code
	const verify_code = Math.floor(100000 + Math.random() * 900000);

	// update user
	user.verify_code = verify_code;
	await user.save();
	const html = securityTemplate(user.name, verify_code);
	// send verify code to user email
	sendEmail({
		email: user.email,
		subject: 'Verification Code',
		html: html,
	}); // send email

	res.status(200).json({
		success: true,
		message: 'Verification code sent to your email',
	});
});

//======================================
// get user by partner_id
//======================================
exports.getUserByPartnerId = catchAsyncErrors(async (req, res, next) => {
	console.log(req.params.id);
	const user = await User.findOne({ partner_id: req.params.id });
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	const userData = {
		_id: user._id,
		name: user.name,
		email: user.email,
		phone: user.phone,
	};
	res.status(200).json({
		success: true,
		user: userData,
	});
});

//======================================
// check email isExist or not
//======================================
exports.checkEmailExist = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	console.log(req.body.email);
	if (user) {
		return res.status(200).json({
			success: true,
			isExist: true,
		});
	} else {
		return res.status(200).json({
			success: true,
			isExist: false,
		});
	}
});

//======================================
// Login user => /api/v1/login
//======================================
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;

	// check if email and password is entered by user
	if (!email || !password) {
		return next(new ErrorHandler('Please enter email and password', 400));
	}

	// find user in database
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorHandler('Invalid Email or Password', 401));
	}

	// check if password is correct or not
	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler('Invalid Email or Password', 401));
	}

	// check if user is verified
	if (!user.email_verified) {
		return next(new ErrorHandler('Please verify your email', 401));
	}

	// send token
	sendToken(user, 200, res);
});

//======================================
// Logout user => /api/v1/logout
//======================================
exports.logout = catchAsyncErrors(async (req, res, next) => {
	// const user = req.user;
	// if (!user) {
	// 	return next(new ErrorHandler('User not found', 404));
	// }
	res.cookie('token', null, {
		expires: new Date(Date.now()),
		httpOnly: true,
	});
	res.status(200).json({
		success: true,
		message: 'Logged out',
	});
});

//======================================
// Load user profile => /api/v1/me
//======================================
exports.loadUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id).select(
		'-password -verify_code -text_password -__v -children -parents'
	);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	// console.log(user);
	res.status(200).json({
		success: true,
		user,
	});
});

//======================================
// Logged in user address => /api/v1/address
//======================================
exports.userAddress = catchAsyncErrors(async (req, res, next) => {
	console.log(req.user._id);
	const address = await Address.findOne({ user_id: req.user._id });
	// console.log(address);
	if (!address) {
		return next(new ErrorHandler('Address not found', 404));
	}
	res.status(200).json({
		success: true,
		address,
	});
});
