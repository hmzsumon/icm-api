const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		short_name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		website: {
			type: String,
			trim: true,
		},
		currency: {
			type: String,
			default: 'USDT',
		},
		address: {
			type: String,
			trim: true,
		},

		city: {
			type: String,
			trim: true,
		},

		state: {
			type: String,
			trim: true,
		},

		zip: {
			type: String,
			trim: true,
		},

		country: {
			type: String,
			default: 'Canada',
		},

		// coin options

		// about
		about: {
			type: String,
			trim: true,
		},
		// company logo
		logo: {
			logo_1: {
				type: String,
				default: '',
			},

			logo_icon: {
				type: String,
			},
		},

		//users
		users: {
			total_users: {
				type: Number,
				default: 0,
			},
			new_users: {
				type: Number,
				default: 0,
			},
			email_verified_users: {
				type: Number,
				default: 0,
			},
			total_active_users: {
				type: Number,
				default: 0,
			},

			logged_in_users: {
				type: Number,
				default: 0,
			},
			kyc_verified_users: {
				type: Number,
				default: 0,
			},
		},

		// withdraw options
		withdraw: {
			is_withdraw: {
				type: Boolean,
				default: true,
			},

			total_withdraw_amount: {
				type: Number,
				default: 0,
			},

			total_withdraw_count: {
				type: Number,
				default: 0,
			},

			total_withdraw_balance: {
				type: Number,
				default: 0,
			},

			pending_withdraw_amount: {
				type: Number,
				default: 0,
			},
			pending_withdraw_count: {
				type: Number,
				default: 0,
			},

			total_c_w_amount: {
				type: Number,
				default: 0,
			},
		},

		// total cost
		cost: {
			total_cost: {
				type: Number,
				default: 0,
			},

			// 4.00 usdt or 2.00 usdt
			referral_bonus_cost: {
				type: Number,
				default: 0,
			},
			// 2.50 usdt or 1.25 usdt
			global_active_cost: {
				type: Number,
				default: 0,
			},
			// 1.30 usdt or 0.65 usdt
			global_subscribe_cost: {
				type: Number,
				default: 0,
			},
			// 2.50 usdt or 1.25 usdt
			team_activation_cost: {
				type: Number,
				default: 0,
			},
			//2.00 usdt or 1.00 usdt
			team_subscribe_cost: {
				type: Number,
				default: 0,
			},

			//1.00 usdt
			owner_activation_cost: {
				type: Number,
				default: 0,
			},
			// 0.70
			owner_subscribe_cost: {
				type: Number,
				default: 0,
			},

			rank_cost: {
				type: Number,
				default: 0,
			},
		},
		// total income
		income: {
			total_income: {
				type: Number,
				default: 0,
			},

			extra_income: {
				type: Number,
				default: 0,
			},

			withdraw_charge: {
				type: Number,
				default: 0,
			},
		},

		// deposit options
		deposit: {
			total_deposit_count: {
				type: Number,
				default: 0,
			},
			total_deposit_amount: {
				type: Number,
				default: 0,
			},

			total_d_bonus: {
				type: Number,
				default: 0,
			},
			new_deposit_amount: {
				type: Number,
				default: 0,
			},
			new_deposit_count: {
				type: Number,
				default: 0,
			},
			rejected_deposit_amount: {
				type: Number,
				default: 0,
			},
			rejected_deposit_count: {
				type: Number,
				default: 0,
			},
		},

		//verify options
		kyc_verify: {
			pending: {
				type: Number,
				default: 0,
			},
			verified: {
				type: Number,
				default: 0,
			},
			rejected: {
				type: Number,
				default: 0,
			},
			new_verify: {
				type: Number,
				default: 0,
			},
		},

		user_demo_count: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
