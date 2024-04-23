const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		partner_id: {
			type: String,
		},
		level_1: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_2: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_3: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_4: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_5: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_6: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_7: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_8: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_9: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		level_10: {
			users: [],
			g_earnings: {
				type: Number,
				default: 0,
			},
			r_earnings: {
				type: Number,
				default: 0,
			},
		},
		total_team_earings: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
