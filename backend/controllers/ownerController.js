const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const { generateUniqueId } = require('../lib/functions');
const owners = require('../utils/owners');
const DepositRecord = require('../models/depositRecord');
const SendRecord = require('../models/sendRecord');
const WithdrawRecord = require('../models/withdrawRecord');
const Owner = require('../models/ownerModel');
// seed owners
exports.seedOwners = catchAsyncErrors(async (req, res, next) => {
	// create owners

	for (let owner of owners) {
		const user = await User.create({
			name: owner.name,
			email: owner.email,
			phone: owner.phone,
			country: 'Bangladesh',
			password: owner.password,
			text_password: owner.password,
			role: 'owner',
			partner_id: generateUniqueId().substring(0, 12),
			email_verified: true,
			is_active: true,
		});

		// create owner
		await Owner.create({
			user_id: user._id,
			partner_id: user.partner_id,
			name: user.name,
		});

		// create deposit record
		await DepositRecord.create({
			user_id: user._id,
			partner_id: user.partner_id,
			username: user.username,
		});

		// SendRecord
		await SendRecord.create({
			user_id: user._id,
			partner_id: user.partner_id,
			username: user.username,
		});

		// create withdraw record
		await WithdrawRecord.create({
			user_id: user._id,
			customer_id: user.customer_id,
			username: user.username,
		});
	}

	res.status(200).json({
		success: true,
		message: 'Owners created successfully',
	});
});
