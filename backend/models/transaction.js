const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		amount: {
			type: Number,
			required: true,
		},
		transactionType: {
			type: String,
			enum: ['cashIn', 'cashOut'],
			required: true,
		},
		purpose: {
			type: String,
			enum: [
				'deposit',
				'withdraw',
				'mining',
				'earn',
				'bonus',
				'subscription',
				'transfer',
				'activation',
				'receive_money',
				'send_money',
				'admin',
			],
			required: true,
		},
		description: {
			type: String,
			default: 'Transaction',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Transaction', transactionSchema);
