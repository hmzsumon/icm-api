const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Please Enter Your Email'],
			validate: [validator.isEmail, 'Please Enter a valid Email'],
		},
		mobile: {
			type: String,
			trim: true,
		},
		dateOfBirth: {
			type: Date,
			trim: true,
		},

		country: {
			type: String,
			required: [true, 'Please Enter Your Country'],
			trim: true,
		},
		passCode: {
			type: String,
			trim: true,
		},
		password: {
			type: String,
			minLength: [6, 'Password should be greater than 6 characters'],
			select: false,
		},
		text_password: {
			type: String,
		},
		partner_id: {
			type: String,
			trim: true,
			unique: true,
			required: [true, 'Please Enter Your Partner ID'],
		},
		avatar: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},
		role: {
			type: String,
			enum: [
				'user',
				'admin',
				'owner',
				'manager',
				'employee',
				'super_admin',
				'agent',
			],
			default: 'user',
		},

		// rank option
		rank: {
			type: String,
			enum: ['partner', 'winner', 'winstar', 'westar', 'kingstar', 'rolex'],
			default: 'partner',
		},

		position: {
			type: Number,
		},
		global_position: {
			type: Number,
		},

		// balance option
		// main balance (over view balance)
		m_balance: {
			type: Number,
			default: 0,
		},

		// earn balances
		e_balance: {
			type: Number,
			default: 0,
		},

		// total commission (global commission + generation commission)
		total_commission: {
			type: Number,
			default: 0,
		},

		// owner option
		owner_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		owner_name: {
			type: String,
		},

		// sponsor
		sponsor: {
			user_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			name: {
				type: String,
			},
		},

		// email verification
		verify_code: {
			type: String,
		},
		email_verified: {
			type: Boolean,
			default: false,
		},
		// kyc verification
		kyc_verified: {
			type: Boolean,
			default: false,
		},
		kyc_request: {
			type: Boolean,
			default: false,
		},

		is_active: {
			type: Boolean,
			default: false,
		},

		QRCode: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
			},
		},

		is_new: {
			type: Boolean,
			default: true,
		},

		is_winner: {
			type: Boolean,
			default: false,
		},

		//2fa
		two_factor_enabled: {
			type: Boolean,
			default: false,
		},

		parents: [],
		children: [],

		active_date: {
			type: Date,
		},

		// block
		is_block: {
			type: Boolean,
			default: false,
		},

		block_date: {
			type: Date,
		},

		// owner option
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},

		owner_option: {
			user_id: {
				type: String,
			},
			name: {
				type: String,
			},
		},

		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Compare Password

userSchema.methods.comparePassword = async function (password) {
	console.log(password);
	console.log(this.password);
	return bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
	// Generating Token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hashing and adding resetPasswordToken to userSchema
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model('User', userSchema);
