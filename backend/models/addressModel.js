const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		partner_id: {
			type: String,
		},
		address: {
			type: String,
		},

		city: {
			type: String,
		},

		state: {
			type: String,
		},

		zip: {
			type: String,
		},

		country: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Address', addressSchema);
