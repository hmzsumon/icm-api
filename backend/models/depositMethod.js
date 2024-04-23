const mongoose = require('mongoose');

const depositMethodSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		user_id: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
		trx_address: { type: String, required: true },
		qr_code_url: { type: String, required: true },
		is_active: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('DepositMethod', depositMethodSchema);
