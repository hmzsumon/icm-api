const Deposit = require('../models/depositModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const AdminNotification = require('../models/adminNotification');
const createTransaction = require('../utils/tnx');
const DepositRecord = require('../models/depositRecord');
const { sendEmail } = require('../utils/sendEmail');
const cloudinary = require('cloudinary');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;
const mongoose = require('mongoose');
const depositTemplate = require('../utils/templateD');
const UserNotification = require('../models/userNotification');
const DepositMethod = require('../models/depositMethod');

// Create a new deposit
exports.createDeposit = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// check if user have a deposit is pending
	const pendingDeposit = await Deposit.findOne({
		user_id: user._id,
		status: 'pending',
	});

	if (pendingDeposit) {
		return next(new ErrorHandler('You have a pending deposit request', 400));
	}

	// find DepositRecord
	let depositRecord = await DepositRecord.findOne({ user_id: req.user.id });
	if (!depositRecord) {
		// create new DepositRecord
		depositRecord = await DepositRecord.create({
			user_id: req.user.id,
			name: user.full_name,
			is_new: false,
		});
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	// console.log(req.body);
	const { amount, transactionId, is_bonus, method } = req.body;

	// convert amount to number
	const numAmount = Number(amount);

	// // unique transactionId
	const isTransactionIdExist = await Deposit.findOne({ transactionId });
	if (isTransactionIdExist) {
		return next(new ErrorHandler('Transaction ID already exist', 405));
	}

	const newDeposit = await Deposit.create({
		user_id: user._id,
		customer_id: user.customer_id,
		name: user.full_name,
		phone: user.phone,
		amount: numAmount,
		transactionId,
		is_bonus,
		method,
	});

	// update deposit details
	if (user.is_newUser) {
		depositRecord.is_new = true;
		await depositRecord.save();
	}

	// update company balance
	company.deposit.new_deposit_amount += numAmount;
	company.deposit.new_deposit_count += 1;
	await company.save();

	// send notification to admin
	const adminNotification = await AdminNotification.create({
		subject: 'New Deposit Request',
		subject_id: newDeposit._id,
		type: 'deposit',
		username: user.name,
		message: `New deposit request of ${amount} from ${user.username}`,
		url: `/deposit/${newDeposit._id}`,
	});

	global.io.emit('notification', adminNotification);

	res.status(201).json({
		success: true,
		message: 'Deposit request received successfully',
		deposit: newDeposit,
	});
});

// Get all deposits
exports.getAllDeposits = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	if (!user.role === 'manager' || !user.role === 'admin') {
		return next(
			new ErrorHandler('You are not authorized to access this route', 403)
		);
	}
	const deposits = await Deposit.find();

	res.status(200).json({
		success: true,
		deposits,
	});
});

// Get a single deposit
exports.getSingleDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findById(req.params.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}
	console.log(deposit.updateAt);
	res.status(200).json({
		success: true,
		deposit,
	});
});

// Update a single deposit
exports.updateDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!deposit) {
		return next(new ErrorHander('No deposit found with that ID', 404));
	}
	res.status(200).json({
		success: true,
		deposit,
	});
});

// get logged in user's deposits
exports.getUserDeposits = catchAsyncErrors(async (req, res, next) => {
	const deposits = await Deposit.find({
		user_id: req.user._id,
	}).sort({ createdAt: -1 });
	res.status(200).json({
		success: true,
		deposits,
	});
});

// delete a single deposit
exports.deleteDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findByIdAndDelete(req.params.id);
	if (!deposit) {
		return next(new ErrorHander('No deposit found with that ID', 404));
	}
	res.status(204).json({
		success: true,
	});
});

// cancel a single deposit
exports.cancelDeposit = catchAsyncErrors(async (req, res, next) => {
	const deposit = await Deposit.findById(req.params.id);
	if (!deposit) {
		return next(new ErrorHander('No deposit found with that ID', 404));
	}
	deposit.status = 'cancelled';
	deposit.cancelledAt = Date.now();
	await deposit.save();
	res.status(200).json({
		success: true,
	});
});

// delete all pending deposits
exports.deleteAllPendingDeposits = catchAsyncErrors(async (req, res, next) => {
	const pendingDeposits = await Deposit.find({ status: 'pending' });
	if (pendingDeposits.length === 0) {
		return next(new ErrorHandler('No pending deposits found', 404));
	}
	for (let i = 0; i < pendingDeposits.length; i++) {
		await pendingDeposits[i].remove();
	}
	res.status(200).json({
		success: true,
	});
});

// approve a single deposit
exports.approveDeposit = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = req.user;
	if (!admin) {
		return next(new ErrorHandler('No admin found with that ID', 404));
	}
	// check if admin or owner is authorized
	if (!admin.role === 'admin' || !admin.role === 'owner') {
		return next(
			new ErrorHandler('You are not authorized to approve deposits', 403)
		);
	}

	// check admin allow_to_deposit is true
	if (!admin.allow_to_deposit) {
		return next(
			new ErrorHandler('You are not authorized to approve deposits', 403)
		);
	}

	// find deposit
	const deposit = await Deposit.findById(req.params.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}

	// check if deposit is already approved
	if (deposit.status === 'approved') {
		return next(new ErrorHandler('Deposit already approved', 400));
	}

	// check if deposit is already rejected
	if (deposit.status === 'rejected') {
		return next(new ErrorHandler('Deposit already rejected', 400));
	}

	// find user
	const user = await User.findById(deposit.user_id);
	if (!user) {
		return next(new ErrorHandler('No user found with that ID', 404));
	}

	// find DepositRecord
	const depositRecord = await DepositRecord.findOne({ user_id: user._id });
	if (!depositRecord) {
		return next(new ErrorHandler('Deposit details not found', 404));
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	//update deposit details
	deposit.status = 'approved';
	deposit.approvedAt = Date.now();
	deposit.approved_by = admin.username;
	deposit.approvedAt = Date.now();
	deposit.is_approved = true;
	deposit.comment = 'Approved by admin';
	deposit.update_by = admin._id;
	await deposit.save();

	// update user
	user.m_balance += deposit.amount;
	createTransaction(
		user._id,
		'cashIn',
		deposit.amount,
		'deposit',
		`Deposit Success ${deposit.amount}`
	);
	user.total_deposit += deposit.amount;

	if (user.is_newUser) {
		// console.log('new user');
		depositRecord.first_deposit_amount += deposit.amount;
		depositRecord.first_deposit_date = Date.now();
		depositRecord.is_new = false;
	}

	// update admin total_deposit_received
	admin.total_deposit_received += deposit.amount;
	await admin.save();

	// update deposit details
	depositRecord.total_deposit += deposit.amount;
	depositRecord.last_deposit_amount += deposit.amount;
	depositRecord.last_deposit_date = Date.now();
	await depositRecord.save();
	await user.save();

	// update company balance
	company.deposit.new_deposit_amount -= deposit.amount;
	company.deposit.new_deposit_count -= 1;
	company.deposit.total_deposit_amount += deposit.amount;
	company.deposit.total_deposit_count += 1;
	await company.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'USDT Deposit Successful',
		description: `Your deposit of ${deposit.amount} has been successful.`,
		url: `/deposits/${deposit._id}`,
	});

	global.io.emit('user-notification', userNotification);

	const html = depositTemplate(
		user.name,
		deposit.amount,
		user.m_balance,
		deposit._id
	);

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Deposit Approved',
		html,
	});

	res.status(200).json({
		success: true,
		message: 'Deposit approved',
	});
});

// reject a single deposit
exports.rejectDeposit = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHandler('No admin found with that ID', 404));
	}
	// find deposit
	// console.log(req.body);
	const deposit = await Deposit.findById(req.body.id);
	if (!deposit) {
		return next(new ErrorHandler('No deposit found with that ID', 404));
	}

	// find user
	const user = await User.findById(deposit.user_id);
	if (!user) {
		return next(new ErrorHandler('No user found with that ID', 404));
	}

	// find DepositRecord
	const depositRecord = await DepositRecord.findOne({ user_id: user._id });
	if (!DepositRecord) {
		return next(new ErrorHandler('Deposit details not found', 404));
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 400));
	}

	//update deposit
	deposit.status = 'rejected';
	deposit.is_rejected = true;
	deposit.reason = req.body.reason;
	deposit.comment = req.body.reason;
	deposit.rejectedAt = Date.now();
	deposit.rejected_by = admin.username;
	deposit.update.update_by = admin._id;
	await deposit.save();

	// update deposit details
	depositRecord.rejected_amount += deposit.amount;
	depositRecord.rejected_count += 1;
	if (depositRecord.rejected_count > 3) {
		user.is_active = false;
		await user.save();
	}
	await depositRecord.save();

	// update company balance
	company.deposit.new_deposit_amount -= deposit.amount;
	company.deposit.new_deposit_count -= 1;
	company.deposit.rejectedDepositAmount += deposit.amount;
	company.deposit.rejectedDepositCount += 1;
	await company.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'USDT Deposit Rejected',
		description: `Your deposit of ${deposit.amount} has been rejected.`,
		reason: req.body.reason,
		url: `/deposit/${deposit._id}`,
	});

	global.io.emit('user-notification', userNotification);

	res.status(200).json({
		success: true,
		message: 'Deposit rejected',
	});
});

// add deposit method
exports.addDepositMethod = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	// check user role is admin
	if (user.role !== 'admin') {
		return next(
			new ErrorHandler('You are not authorized to access this route', 403)
		);
	}

	const { username, trxAddress, url } = req.body;

	// check if user already have a deposit method
	const existMethod = await DepositMethod.findOne({ username: username });
	if (existMethod) {
		return next(new ErrorHandler('User already have a deposit method', 400));
	}

	// fin user by username
	const owner = await User.findOne({ username });
	if (!owner) {
		return next(new ErrorHandler('User not found', 404));
	}

	// create new deposit method
	const newMethod = await DepositMethod.create({
		username,
		user_id: owner._id,
		trx_address: trxAddress,
		qr_code_url: url,
	});

	//update owner allow_to_deposit
	owner.allow_to_deposit = true;
	await owner.save();

	res.status(201).json({
		success: true,
		message: 'Deposit method added successfully',
		method: newMethod,
	});
});

// get all deposit methods
exports.getAllDepositMethods = catchAsyncErrors(async (req, res, next) => {
	const methods = await DepositMethod.find();
	res.status(200).json({
		success: true,
		methods,
	});
});

// active a single deposit method
exports.activeDepositMethod = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}
	// check user role is admin
	if (user.role !== 'admin') {
		return next(
			new ErrorHandler('You are not authorized to access this route', 403)
		);
	}

	const method = await DepositMethod.findById(req.params.id);
	if (!method) {
		return next(new ErrorHandler('Deposit method not found', 404));
	}

	// inactive all deposit methods first before activating a new one
	const methods = await DepositMethod.find();
	for (let i = 0; i < methods.length; i++) {
		methods[i].is_active = false;
		await methods[i].save();
	}

	method.is_active = true;
	await method.save();
	global.io.emit('deposit-method', method);

	res.status(200).json({
		success: true,
		message: 'Deposit method activated successfully',
		method,
	});
});

// get active deposit method
exports.getActiveDepositMethod = catchAsyncErrors(async (req, res, next) => {
	const method = await DepositMethod.findOne({ is_active: true });
	if (!method) {
		return next(new ErrorHandler('No deposit method found', 404));
	}
	// socket.io

	res.status(200).json({
		success: true,
		method,
	});
});
