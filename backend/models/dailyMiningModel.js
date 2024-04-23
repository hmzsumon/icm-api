const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dailyMiningSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		daily_mining_balance: {
			type: Number,
			default: 0,
		},
		speed: {
			type: Number,
			default: 0.2,
		},
		date: {
			type: String,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('DailyMining', dailyMiningSchema);
