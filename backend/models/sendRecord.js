const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sendRecordSchema = new Schema(
	{
		user_id: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		partner_id: {
			type: String,
			required: true,
		},

		username: {
			type: String,
		},

		total_send_amount: {
			type: Number,
			default: 0,
		},

		total_send_count: {
			type: Number,
			default: 0,
		},
		last_send_amount: {
			type: Number,
			default: 0,
		},
		last_recipient: {
			username: {
				type: String,
			},
			customer_id: {
				type: String,
			},
		},
		last_send_date: {
			type: Date,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('SendRecord', sendRecordSchema);
