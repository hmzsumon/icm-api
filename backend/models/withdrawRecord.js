const mongoose = require('mongoose');

const withdrawRecord = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		username: {
			type: String,
			require: true,
		},
		partner_id: {
			type: String,
			require: true,
		},

		total_withdraw: {
			type: Number,
			default: 0,
		},
		last_withdraw_amount: {
			type: Number,
			default: 0,
		},
		last_withdraw_date: {
			type: Date,
		},
		total_cancel_withdraw: {
			type: Number,
			default: 0,
		},
		last_cancel_withdraw_amount: {
			type: Number,
			default: 0,
		},
		last_cancel_withdraw_date: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('WithdrawRecord', withdrawRecord);
