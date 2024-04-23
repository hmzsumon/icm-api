const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		partner_id: {
			type: String,
			required: true,
		},
		total_receive_amount: {
			type: Number,
			default: 0,
		},

		total_send_amount: {
			type: Number,
			default: 0,
		},

		total_deposit: {
			type: Number,
			default: 0,
		},

		total_withdraw: {
			type: Number,
			default: 0,
		},

		total_pay: {
			type: Number,
			default: 0,
		},

		total_earing: {
			type: Number,
			default: 0,
		},

		// global earning
		total_global_earing: {
			type: Number,
			default: 0,
		},

		// current global earning
		current_global_earing: {
			type: Number,
			default: 0,
		},

		// referral earning
		total_referral_earning: {
			type: Number,
			default: 0,
		},

		//generation earning
		total_generation_earning: {
			type: Number,
			default: 0,
		},

		//current generation earning
		current_generation_earning: {
			type: Number,
			default: 0,
		},

		// rank earning
		total_rank_earning: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
