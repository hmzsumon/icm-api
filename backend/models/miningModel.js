const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const miningSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		username: {
			type: String,
			required: true,
		},
		customer_id: {
			type: String,
			required: true,
		},
		mining_balance: {
			type: Number,
			default: 100,
		},
		// today mining balance
		daily_mining_balance: {
			type: Number,
			default: 0,
		},
		// speed amount 0.2/hour
		start_speed: {
			type: Number,
			default: 0.08,
		},

		start_at: {
			type: Date,
		},
		end_at: {
			type: Date,
		},
		// per day
		mining_time: {
			type: Number,
			default: 1440,
		},
		// total mining time
		total_mining_time: {
			type: Number,
			default: 0,
		},
		is_start: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Mining', miningSchema);
