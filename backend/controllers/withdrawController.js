const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const createTransaction = require('../utils/tnx');
const AdminNotification = require('../models/adminNotification');
const WithdrawRecord = require('../models/withdrawRecord');
const Company = require('../models/companyModel');
const withdrawTemplate1 = require('../utils/templateW');
const withdrawTemplate2 = require('../utils/templateAw');
const companyId = process.env.COMPANY_ID;
const Notification = require('../models/notificationModel');
const { sendEmail } = require('../utils/sendEmail');
const Withdraw = require('../models/withdraw');
const UserNotification = require('../models/userNotification');

// Create new withdraw request => /api/v1/withdraw/new
exports.newWithdrawRequest = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	// check if user is active
	if (!user.is_active) {
		return next(new ErrorHandler('User is not active', 400));
	}

	const { amount, net_amount, charge_p, method } = req.body;
	// console.log(typeof amount, typeof net_amount, typeof charge_p, typeof method);
	const numAmount = Number(amount);
	const charge = charge_p;

	// check if user is_active
	if (!user.is_active) {
		return next(new ErrorHandler('User is not active', 400));
	}

	// check if user has enough balance
	if (user.m_balance < numAmount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// check if user has pending withdraw request
	const pendingWithdraw = await Withdraw.findOne({
		user_id: user._id,
		status: 'pending',
	});

	if (pendingWithdraw) {
		return next(
			new ErrorHandler(
				"You have a pending withdraw request. You can't create a new one",
				902
			)
		);
	}

	// find withdraw details
	let withdrawDetails = await WithdrawRecord.findOne({
		user_id: user._id,
	});

	if (!withdrawDetails) {
		// create new withdraw details
		withdrawDetails = WithdrawRecord.create({
			user_id: req.user.id,
			name: user.name,
			phone: user.phone,
		});

		return next(
			new ErrorHandler('Something went wrong. Please try again!', 901)
		);
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// user balance
	user.m_balance = user.m_balance - numAmount;
	createTransaction(
		user._id,
		'cashOut',
		numAmount,
		'withdraw',
		`Withdraw request for ${numAmount} was created`
	);
	user.is_withdraw_requested = true;

	// create new withdraw request
	const withdraw = await Withdraw.create({
		user_id: req.user.id,
		customer_id: user.customer_id,
		username: user.username,
		phone: user.phone,
		email: user.email,
		amount: numAmount,
		net_amount,
		charge,
		method,
	});
	await user.save();

	// update company balance
	company.withdraw.pending_withdraw_amount += numAmount;
	company.withdraw.pending_withdraw_count += 1;
	await company.save();
	// send notification to admin
	const adminNotification = await AdminNotification.create({
		subject: 'New withdraw request',
		subject_id: withdraw._id,
		type: 'withdraw',
		username: user.name,
		message: `New withdraw request of ${numAmount} was created by ${user.name}`,
		url: `/withdraw/${withdraw._id}`,
	});

	global.io.emit('notification', adminNotification);
	const html = withdrawTemplate1(user.name, numAmount, withdraw._id);

	// send email
	sendEmail({
		email: user.email,
		subject: 'Withdraw request created',
		html: html,
	});

	res.status(200).json({
		success: true,
		message: 'Withdraw request created successfully',
		withdraw,
	});
});

// get logged in user withdraw requests => /api/v1/withdraw/requests
exports.myWithdraws = catchAsyncErrors(async (req, res, next) => {
	const withdraws = await Withdraw.find({ user_id: req.user._id }).sort({
		createdAt: -1,
	});
	if (!withdraws) {
		return next(new ErrorHandler('Withdraw requests not found', 404));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawRecord.findOne({
		user_id: req.user._id,
	});

	if (!withdrawDetails) {
		// create new withdraw details
		await WithdrawRecord.create({
			user_id: req.user.id,
			name: req.user.name,
			phone: req.user.phone,
		});

		return next(
			new ErrorHandler('Something went wrong. Please try again!', 901)
		);
	}

	res.status(200).json({
		success: true,
		withdraws,
		withdrawDetails,
	});
});

// get a single withdraw request => /api/v1/withdraw/:id
exports.getWithdraw = catchAsyncErrors(async (req, res, next) => {
	const withdraw = await Withdraw.findById(req.params.id);
	if (!withdraw) {
		return next(new ErrorHandler('Withdraw request not found', 404));
	}

	res.status(200).json({
		success: true,
		withdraw,
	});
});

// get all withdraw requests => /api/v1/admin/withdraws
exports.allWithdraws = catchAsyncErrors(async (req, res, next) => {
	const withdraws = await Withdraw.find();
	if (!withdraws) {
		return next(new ErrorHandler('Withdraw requests not found', 404));
	}

	res.status(200).json({
		success: true,
		withdraws,
	});
});

// get single withdraw for admin and manager => /api/v1/admin/withdraw/:id
exports.getWithdrawForAdmin = catchAsyncErrors(async (req, res, next) => {
	const withdraw = await Withdraw.findById(req.params.id);
	if (!withdraw) {
		return next(new ErrorHandler('Withdraw request not found', 404));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawRecord.findOne({
		user_id: withdraw.user_id,
	});

	res.status(200).json({
		success: true,
		withdraw,
		withdrawDetails,
	});
});

// approve withdraw request => /api/v1/admin/withdraw/:id/approve
exports.approveWithdraw = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 404));
	}

	// check admin allow_to_withdraw
	if (!admin.allow_to_withdraw) {
		return next(new ErrorHandler('You are not allowed to withdraw', 400));
	}

	// find withdraw request
	const withdraw = await Withdraw.findById(req.body.id);
	if (!withdraw) {
		return next(new ErrorHandler('Withdraw request not found', 404));
	}

	// check if withdraw request is already approved
	if (withdraw.is_approved) {
		return next(new ErrorHandler('Withdraw request already approved', 400));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawRecord.findOne({
		user_id: withdraw.user_id,
	});

	if (!withdrawDetails) {
		// create new withdraw details
		await WithdrawRecord.create({
			user_id: withdraw.user_id,
			name: withdraw.name,
			phone: withdraw.phone,
		});

		return next(
			new ErrorHandler('Something went wrong. Please try again!', 901)
		);
	}
	// find user
	const user = await User.findById(withdraw.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	let e_address = '';

	// update withdraw request
	withdraw.is_approved = true;
	withdraw.approved_by = admin._id;
	withdraw.approved_at = Date.now();
	withdraw.status = 'approved';
	if (withdraw.method.name === 'crypto') {
		withdraw.approved_method = {
			name: withdraw.method.name,
			network: withdraw.method.network,
			address: req.body.tnxId,
		};
		e_address = withdraw.method.address;
	}
	if (withdraw.method.name === 'binance') {
		withdraw.approved_method = {
			name: withdraw.method.name,
			pay_id: req.body.tnxId,
		};
		e_address = withdraw.method.pay_id;
	}
	await withdraw.save();

	// update user balance
	user.is_withdraw_requested = false;
	user.total_withdraw += withdraw.amount;
	await user.save();

	// update withdraw details
	withdrawDetails.total_withdraw += withdraw.amount;
	withdrawDetails.last_withdraw_amount = withdraw.amount;
	withdrawDetails.last_withdraw_date = Date.now();
	await withdrawDetails.save();

	// update company balance
	company.withdraw.total_withdraw_amount += withdraw.amount;
	company.withdraw.total_withdraw_count += 1;
	company.withdraw.total_w_charge += withdraw.charge;
	company.withdraw.pending_withdraw_amount -= withdraw.amount;
	company.withdraw.pending_withdraw_count -= 1;
	company.income.total_income += withdraw.charge;
	company.income.withdraw_charge += withdraw.charge;
	await company.save();

	// update admin balance
	admin.total_withdraw_approved += withdraw.amount;
	await admin.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'USDT Withdraw Successful',
		description: `Your withdraw request of ${withdraw.amount} was approved`,
		url: `/withdraw`,
	});

	global.io.emit('user-notification', userNotification);

	const html = withdrawTemplate2(
		user.name,
		withdraw.amount,
		withdraw._id,
		e_address
	);

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Withdraw request approved',
		html: html,
	});

	res.status(200).json({
		success: true,
		message: 'Withdraw request approved successfully',
	});
});

// reject withdraw request => /api/v1/admin/withdraw/:id/reject
exports.rejectWithdraw = catchAsyncErrors(async (req, res, next) => {
	const admin = await User.findById(req.user._id);
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 404));
	}

	// check admin allow_to_withdraw
	if (!admin.allow_to_withdraw) {
		return next(new ErrorHandler('You are not allowed to withdraw', 400));
	}

	// find withdraw request
	const withdraw = await Withdraw.findById(req.body.id);
	if (!withdraw) {
		return next(new ErrorHandler('Withdraw request not found', 404));
	}

	// check if withdraw request is already approved
	if (withdraw.is_rejected) {
		return next(new ErrorHandler('Withdraw request already rejected', 400));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawRecord.findOne({
		user_id: withdraw.user_id,
	});

	if (!withdrawDetails) {
		return next(
			new ErrorHandler('Something went wrong. Please try again!', 901)
		);
	}

	// find user
	const user = await User.findById(withdraw.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// update withdraw request
	withdraw.is_rejected = true;
	withdraw.rejected_by = admin._id;
	withdraw.rejected_at = Date.now();
	withdraw.status = 'rejected';
	withdraw.rejected_reason = req.body.reason;
	withdraw.comment = req.body.reason;
	withdraw.update_by = admin.username;
	await withdraw.save();

	// update user balance
	user.is_withdraw_requested = false;
	user.m_balance += withdraw.amount;
	createTransaction(
		user._id,
		'cashIn',
		withdraw.amount,
		'withdraw',
		`Withdraw request of ${withdraw.amount} was rejected`
	);

	await user.save();

	// update withdraw details
	withdrawDetails.total_rejected += withdraw.amount;
	await withdrawDetails.save();

	// update company balance
	company.withdraw.pending_withdraw_amount -= withdraw.amount;
	company.withdraw.pending_withdraw_count -= 1;
	await company.save();

	// send notification to user
	const userNotification = await UserNotification.create({
		user_id: user._id,
		subject: 'USDT Withdraw Rejected',
		description: `Your withdraw request of ${withdraw.amount} was rejected for ${req.body.reason}`,
		url: `/withdraw`,
	});

	global.io.emit('user-notification', userNotification);

	res.status(200).json({
		success: true,
		message: 'Withdraw request rejected successfully',
	});
});

// cancel withdraw request => /api/v1/admin/withdraw/:id/cancel
exports.cancelWithdraw = catchAsyncErrors(async (req, res, next) => {
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 404));
	}

	// find withdraw request
	const withdraw = await Withdraw.findById(req.body.id);
	if (!withdraw) {
		return next(new ErrorHandler('Withdraw request not found', 404));
	}

	// check if withdraw request is already approved
	if (withdraw.is_cancelled) {
		return next(new ErrorHandler('Withdraw request already approved', 400));
	}

	// find withdraw details
	const withdrawDetails = await WithdrawRecord.findOne({
		user_id: withdraw.user_id,
	});

	if (!withdrawDetails) {
		return next(
			new ErrorHandler('Something went wrong. Please try again!', 901)
		);
	}
	// find user
	const user = await User.findById(withdraw.user_id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find company
	const company = await Company.findOne();
	if (!company) {
		return next(new ErrorHandler('Company not found', 404));
	}

	// update withdraw request
	withdraw.is_cancelled = true;
	withdraw.cancelled_by = admin._id;
	withdraw.cancelled_at = Date.now();
	withdraw.status = 'cancelled';
	withdraw.cancelled_reason = req.body.reason;
	withdraw.comment = req.body.reason;
	await withdraw.save();

	// update user balance
	user.is_withdraw_requested = false;
	user.w_balance += withdraw.amount;
	createTransaction(
		user._id,
		'cashIn',
		withdraw.amount,
		'withdraw',
		`Withdraw request of ${numAmount} was cancelled`
	);

	await user.save();

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Withdraw request cancelled',
		message: `Dear ${user.name},\n\nYour withdraw request of ${withdraw.amount} has been cancelled.\n\nReason: ${req.body.reason}\n\nThank you.\n\nBest regards,\n${company.name}`,
	});

	res.status(200).json({
		success: true,
		message: 'Withdraw request cancelled successfully',
	});
});

// update owner allow_to_withdraw
exports.updateAllowToWithdraw = catchAsyncErrors(async (req, res, next) => {
	console.log(req.body);
	// find admin
	const admin = await User.findById(req.user.id);
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 404));
	}

	// find all owners
	const owners = await User.find({ role: 'owner' });
	if (!owners) {
		return next(new ErrorHandler('Owners not found', 404));
	}

	// update all owners allow_to_withdraw false
	owners.forEach(async (owner) => {
		owner.allow_to_withdraw = false;
		await owner.save();
	});

	// find user
	const user = await User.findById(req.body.id);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// update user
	user.allow_to_withdraw = req.body.allow_to_withdraw;
	await user.save();

	res.status(200).json({
		success: true,
		message: 'Allow to withdraw updated successfully',
	});
});
