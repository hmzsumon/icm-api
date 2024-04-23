const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankRecordSchema = new Schema(
	{
		user_id: { type: Schema.Types.ObjectId, ref: 'User' },
		partner_id: {
			type: String,
			required: true,
		},
		email: {
			type: String,
		},
		ranks: [],
		current_rank: {
			type: String,
		},
		current_rank_amount: {
			type: Number,
		},
		rank_updated_at: {
			type: Date,
		},
		rank_history: [
			{
				rank: {
					type: String,
				},
				updated_at: {
					type: Date,
				},
				approved_at: {
					type: Date,
				},
				amount: {
					type: Number,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('RankRecord', rankRecordSchema);
