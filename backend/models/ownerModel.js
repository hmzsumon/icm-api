const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		partner_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
		},

		total_deposit: {
			type: Number,
			default: 0,
		},

		total_withdraw: {
			type: Number,
			default: 0,
		},

		total_users: {
			type: Number,
			default: 0,
		},

		active_users: {
			type: Number,
			default: 0,
		},
		available_balance: {
			type: Number,
			default: 0,
		},

		receive_fund: {
			type: Number,
			default: 0,
		},

		total_income: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Owner', ownerSchema);
