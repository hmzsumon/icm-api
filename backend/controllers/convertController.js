const Deposit = require('../models/depositModel');
const User = require('../models/userModel');
const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const createTransaction = require('../utils/tnx');

const { sendEmail } = require('../utils/sendEmail');
const ConvertDetails = require('../models/convertDetails');
const SendDetails = require('../models/sendDetails');

const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;

// new convert
exports.newConvert = catchAsyncErrors(async (req, res, next) => {
	const { amount, type } = req.body;
	const numAmount = Number(amount);

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// find user
	const user = await User.findById(req.user.id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	// find ConvertDetails
	const convertDetails = await ConvertDetails.findOne({ user_id: req.user.id });
	if (!convertDetails) {
		// create new convertDetails
		await ConvertDetails.create({
			user_id: req.user.id,
			name: user.name,
			phone: user.phone,
		});

		return next(new ErrorHander('ConvertDetails not found', 901));
	}

	if (type === 'bonus') {
		// check user balance
		if (user.b_balance < numAmount) {
			return next(new ErrorHander('Insufficient balance', 400));
		}
		const charge = 0.05 * numAmount;
		const total = numAmount - charge;
		user.b_balance -= numAmount;
		createTransaction(
			user._id,
			'cashOut',
			numAmount,
			'convert',
			`Convert ${numAmount} bonus to main balance`
		);
		user.m_balance += total;
		createTransaction(
			user._id,
			'cashIn',
			total,
			'convert',
			`Convert ${total} bonus to main balance, - 5% charge ${Number(
				charge
			).toFixed(2)}`
		);
		// update company balance
		company.income.convert_charge += charge;
		company.income.total_income += charge;

		// update convertDetails
		convertDetails.total_bb_convert += numAmount;
	}
	if (type === 'withdraw') {
		// check user balance
		if (user.w_balance < numAmount) {
			return next(new ErrorHander('Insufficient balance', 400));
		}
		const charge = 0.1 * numAmount;
		const total = numAmount - charge;
		user.w_balance -= numAmount;
		createTransaction(
			user._id,
			'cashOut',
			numAmount,
			'convert',
			`Convert ${numAmount} bonus to main balance`
		);
		user.m_balance += total;
		createTransaction(
			user._id,
			'cashIn',
			total,
			'convert',
			`Convert ${total} bonus to main balance, - 10% charge ${Number(
				charge
			).toFixed(2)}`
		);
		// update company balance
		company.income.convert_charge += charge;
		company.income.total_income += charge;

		// update convertDetails
		convertDetails.total_wb_convert += numAmount;
	}
	convertDetails.total_convert += numAmount;
	convertDetails.total_count += 1;
	convertDetails.last_convert = numAmount;
	convertDetails.last_convert_date = Date.now();
	await convertDetails.save();

	await user.save();
	await company.save();

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Convert success',
		message: `Dear ${user.name}, you have successfully convert ${numAmount} to main balance`,
	});

	res.status(200).json({
		success: true,
		message: 'Convert success',
	});
});

//=============================================
// send money Option
//=============================================

// send money to user
exports.sendMoney = catchAsyncErrors(async (req, res, next) => {
	// find user
	const user = await User.findById(req.user.id);
	if (!user) {
		return next(new ErrorHander('User not found', 404));
	}

	const { amount, phone } = req.body;
	const numAmount = Number(amount);

	// find receiver
	const receiver = await User.findOne({ phone });
	if (!receiver) {
		return next(new ErrorHander('Receiver not found', 404));
	}

	// check user itself is receiver
	if (user._id === receiver._id) {
		return next(new ErrorHander('You cannot send money to yourself', 400));
	}

	// check receiver is active
	if (!receiver.is_active) {
		return next(new ErrorHander('Receiver is not active user!', 400));
	}

	// find company
	const company = await Company.findById(companyId);
	if (!company) {
		return next(new ErrorHander('Company not found', 404));
	}

	// find ConvertDetails
	const sendDetails = await SendDetails.findOne({ user_id: req.user.id });
	if (!sendDetails) {
		// create new convertDetails
		await SendDetails.create({
			user_id: req.user.id,
			name: user.name,
			phone: user.phone,
		});

		return next(new ErrorHander('ConvertDetails not found', 901));
	}

	// check user balance
	if (user.m_balance < numAmount) {
		return next(new ErrorHander('Insufficient balance', 400));
	}

	// update user balance
	user.m_balance -= numAmount;
	createTransaction(
		user._id,
		'cashOut',
		numAmount,
		'sendMoney',
		`Send ${numAmount} &#8354; to ${receiver.name}`
	);
	await user.save();

	// update receiver balance
	receiver.m_balance += numAmount;
	createTransaction(
		receiver._id,
		'cashIn',
		numAmount,
		'sendMoney',
		`Received ${numAmount} &#8354; from ${user.name}`
	);
	receiver.total_receive_amount += numAmount;
	await receiver.save();

	// send details
	sendDetails.total_send_amount += numAmount;
	sendDetails.total_send_count += 1;
	sendDetails.last_send_amount = numAmount;
	sendDetails.last_send_date = Date.now();

	sendDetails.last_receiver = {
		name: receiver.name,
		phone: receiver.phone,
	};
	await sendDetails.save();
	// update company balance
	company.users.total_send_money_users += numAmount;
	await company.save();

	// send email to user
	sendEmail({
		email: user.email,
		subject: 'Send money success',
		message: `Dear ${user.name}, you have successfully send ${numAmount} BDT to ${receiver.name}`,
	});

	// send email to receiver
	sendEmail({
		email: receiver.email,
		subject: 'Received money',
		message: `Dear ${receiver.name}, you have successfully received ${numAmount} BDT from ${user.name}`,
	});

	res.status(200).json({
		success: true,
		message: 'Send money success',
	});
});
