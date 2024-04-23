const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const convertDetailsSchema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		name: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		total_convert: {
			type: Number,
			default: 0,
		},
		// spot to funding
		total_spot_to_funding: {
			type: Number,
			default: 0,
		},

		// earning to funding
		total_earning_to_funding: {
			type: Number,
			default: 0,
		},

		// mining to funding
		total_mining_to_funding: {
			type: Number,
			default: 0,
		},

		// funding to spot
		total_funding_to_spot: {
			type: Number,
			default: 0,
		},

		last_convert: {
			type: Number,
			default: 0,
		},
		last_convert_date: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ConvertDetails', convertDetailsSchema);
