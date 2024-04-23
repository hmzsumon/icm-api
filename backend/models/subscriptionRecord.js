const mongoose = require('mongoose');

const subscriptionRecord = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		customer_id: {
			type: String,
		},
		username: {
			type: String,
		},
		total_subscription: {
			type: Number,
			default: 0,
		},
		last_subscription_date: {
			type: Date,
		},
		next_subscription_date: {
			type: Date,
		},
		is_subscribe: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('SubscriptionRecord', subscriptionRecord);
