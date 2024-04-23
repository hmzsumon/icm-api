const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const UserNotification = require('../models/userNotification');
const Transaction = require('./../models/transaction');
const User = require('./../models/userModel');
const { sendEmail } = require('../utils/sendEmail');
const createTransaction = require('../utils/tnx');
const SendRecord = require('../models/sendRecord');
// get all transactions
exports.getAllTransactions = catchAsyncErrors(async (req, res, next) => {
	const transactions = await Transaction.find({});
	res.status(200).json({
		success: true,
		transactions,
	});
});

// get single transaction
exports.getSingleTransaction = catchAsyncErrors(async (req, res, next) => {
	const transaction = await Transaction.findById(req.params.id)
		.populate('author', '-password', 'name email')
		.populate('recipient', '-password', 'name email');
	if (!transaction) {
		return new ErrorHander(404, 'Transaction not found');
	}
	res.status(200).json({
		success: true,
		transaction,
	});
});

// get logged in user transactions
exports.getUserTransactions = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const send = await Transaction.find({
		author: userId,
	});

	const receive = await Transaction.find({
		recipient: userId,
	})
		.populate(
			'author',
			'-transactions -avatar -password  -phone -address -balance -pxc_balance -sponsor_id -referral_token -referal_users -createdAt -updatedAt '
		)
		.populate(
			'recipient',
			'-transactions -avatar -password -email  -phone -address -balance -pxc_balance -sponsor_id -referral_token -referal_users -createdAt -updatedAt'
		);
	let totalTransactions = (await send.length) + receive.length;
	res.status(200).json({
		success: true,
		totalTransactions,
		transactions: {
			send,
			receive,
		},
	});
});

// send money
exports.sendMoney = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const { amount, recipient_id } = req.body;

	const sender = await User.findById(userId).select('+password');
	if (!sender) {
		return next(new ErrorHandler('Sender not found', 404));
	}

	if (sender.m_balance < amount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	const recipient = await User.findById(recipient_id);
	if (!recipient) {
		return new ErrorHandler('Recipient not found', 404);
	}

	// find sendRecord
	let sendRecord = await SendRecord.findOne({ user_id: userId });
	if (!sendRecord) {
		sendRecord = await SendRecord.create({
			user_id: userId,
			customer_id: sender.customer_id,
			username: sender.username,
			last_send_amount: amount,
			last_send_date: Date.now(),
			last_recipient: {
				username: recipient.username,
				customer_id: recipient.customer_id,
			},
		});
	} else {
		sendRecord.total_send_amount += amount;
		sendRecord.total_send_count += 1;
		sendRecord.last_send_amount = amount;
		sendRecord.last_send_date = Date.now();
		sendRecord.last_recipient = {
			username: recipient.username,
			customer_id: recipient.customer_id,
		};
		await sendRecord.save();
	}

	// update sender balance
	sender.m_balance -= amount;
	sender.total_send_amount += amount;
	createTransaction(
		sender._id,
		'cashOut',
		amount,
		'send_money',
		`Send money to ${recipient.username}`
	);
	await sender.save();

	// update recipient balance
	recipient.m_balance += amount;
	recipient.total_receive_amount += amount;
	createTransaction(
		recipient._id,
		'cashIn',
		amount,
		'receive_money',
		`Receive money from ${sender.username}`
	);
	await recipient.save();

	// send notification to recipient
	const userNotification = await UserNotification.create({
		user_id: recipient._id,
		subject: 'Receive money',
		description: `You have received ${amount} USDT from ${sender.username}`,
	});

	global.io.emit('user-notification', userNotification);

	res.status(200).json({
		success: true,
		message: 'Transaction successful',
	});
});

// get login user transactions
exports.getLoginUserTransactions = catchAsyncErrors(async (req, res, next) => {
	const userId = req.user._id;
	const transactions = await Transaction.find({ user_id: userId }).sort({
		createdAt: -1,
	});
	res.status(200).json({
		success: true,
		transactions,
	});
});
