const mongoose = require('mongoose');

const loginInfoSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		partner_id: {
			type: String,
			required: true,
		},
		current_login_info: {
			date: {
				type: Date,
			},
			ip_address: {
				type: String,
			},
		},
		last_login_info: {
			date: {
				type: Date,
			},
			ip_address: {
				type: String,
			},
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('LoginInfo', loginInfoSchema);
