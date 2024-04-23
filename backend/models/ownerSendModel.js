const mongoose = require('mongoose');

const ownerSendSchema = mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		senderName: {
			type: String,
			required: true,
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		recipientName: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		transactionId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

const OwnerSend = mongoose.model('OwnerSend', ownerSendSchema);

module.exports = OwnerSend;
