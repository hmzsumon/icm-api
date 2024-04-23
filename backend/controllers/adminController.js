const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const Transaction = require('../models/transaction');
const UserNotification = require('../models/userNotification');
const createTransaction = require('../utils/tnx');

// admin login
exports.adminLogin = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;
	console.log(email, password);
	// check if email and password is entered by admin
	if (!email || !password) {
		return next(new ErrorHandler('Please enter email & password', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorHandler('Invalid email or password', 401));
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler('Invalid email or password', 401));
	}

	// check if user is admin
	if (user.role !== 'admin') {
		return next(
			new ErrorHandler("You don't have permission to access this resource", 403)
		);
	}

	sendToken(user, 200, res);
});

// add money to user account or company account
exports.addMoneyFromAdmin = catchAsyncErrors(async (req, res, next) => {
	const { wallet, wallet_type, amount, recipient_id } = req.body;

	// find company
	const company = await Company.findOne();

	// find admin
	const admin = await User.findById(req.user._id);
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 400));
	}

	// check if admin m_balance is greater than amount
	if (admin.m_balance < amount) {
		return next(new ErrorHandler('Insufficient balance', 400));
	}

	// check if wallet  is company
	if (wallet === 'company') {
		if (wallet_type === 'coin') {
			company.income.coin_value += amount;
		} else if (wallet_type === 'tour') {
			company.income.tour_fund += amount;
		} else if (wallet_type === 'extra') {
			company.income.extra_income += amount;
		} else if (wallet_type === 'rank') {
			company.income.rank_value += amount;
		} else if (wallet_type === 'kyc') {
			company.income.kyc_charge += amount;
		} else if (wallet_type === 'withdraw') {
			company.income.withdraw_charge += amount;
		} else {
			return next(new ErrorHandler('Invalid wallet type', 400));
		}
		await company.save();
		createTransaction(
			admin._id,
			'cashOut',
			amount,
			'admin',
			`deducted ${amount} from admin wallet for ${wallet} ${wallet_type}`
		);
	}

	// check if wallet is user
	if (wallet === 'user') {
		// find recipient
		const recipient = await User.findById(recipient_id);
		if (!recipient) {
			return next(new ErrorHandler('Recipient not found', 400));
		}

		//update recipient m_balance
		recipient.m_balance += amount;
		createTransaction(
			recipient._id,
			'cashIn',
			amount,
			'admin',
			`added ${amount} to ${recipient.username} wallet`
		);
		await recipient.save();

		// create transaction for admin
		createTransaction(
			admin._id,
			'cashOut',
			amount,
			'admin',
			`deducted ${amount} from admin wallet for ${recipient.username} wallet`
		);
	}

	//update admin m_balance
	admin.m_balance -= amount;
	await admin.save();

	res.status(200).json({
		success: true,
		message: 'Money added successfully',
	});
});

// deduct money from user account or company account
exports.deductMoneyFromAdmin = catchAsyncErrors(async (req, res, next) => {
	const { wallet, wallet_type, amount, recipient_id, description } = req.body;

	// find company
	const company = await Company.findOne();

	// find admin
	const admin = await User.findById(req.user._id);
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 400));
	}

	// check if wallet  is company
	if (wallet === 'company') {
		if (wallet_type === 'coin') {
			if (company.income.coin_value < amount) {
				return next(new ErrorHandler('Insufficient balance', 400));
			}
			company.income.coin_value -= amount;
		} else if (wallet_type === 'tour') {
			if (company.income.tour_fund < amount) {
				return next(new ErrorHandler('Insufficient balance', 400));
			}
			company.income.tour_fund -= amount;
		} else if (wallet_type === 'extra') {
			if (company.income.extra_income < amount) {
				return next(new ErrorHandler('Insufficient balance', 400));
			}
			company.income.extra_income -= amount;
		} else if (wallet_type === 'rank') {
			if (company.income.rank_value < amount) {
				return next(new ErrorHandler('Insufficient balance', 400));
			}
			company.income.rank_value -= amount;
		} else if (wallet_type === 'kyc') {
			if (company.income.kyc_charge < amount) {
				return next(new ErrorHandler('Insufficient balance', 400));
			}
			company.income.kyc_charge -= amount;
		} else if (wallet_type === 'withdraw') {
			if (company.income.withdraw_charge < amount) {
				return next(new ErrorHandler('Insufficient balance', 400));
			}
			company.income.withdraw_charge -= amount;
		} else {
			return next(new ErrorHandler('Invalid wallet type', 400));
		}
		await company.save();
		createTransaction(
			admin._id,
			'cashIn',
			amount,
			'admin',
			`added ${amount} to admin wallet for ${wallet} ${wallet_type}`
		);
	}

	// check if wallet is user
	if (wallet === 'user') {
		// find user
		const user = await User.findById(recipient_id);
		if (!user) {
			return next(new ErrorHandler('User not found', 400));
		}

		// check if user m_balance is greater than amount
		if (user.m_balance < amount) {
			return next(new ErrorHandler('Insufficient balance', 400));
		}

		//update user m_balance
		user.m_balance -= amount;
		createTransaction(user._id, 'cashOut', amount, 'admin', `${description} `);
		await user.save();
	}

	// update admin m_balance
	admin.m_balance += amount;
	createTransaction(
		admin._id,
		'cashIn',
		amount,
		'admin',
		`added ${amount} to admin wallet for ${description}`
	);
	await admin.save();

	res.status(200).json({
		success: true,
		message: 'Money deducted successfully',
	});
});

// get all users
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find({ role: 'user' });
	res.status(200).json({
		success: true,
		users,
	});
});
