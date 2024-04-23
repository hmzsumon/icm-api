const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const Mining = require('../models/miningModel');
const Team = require('../models/teamModel');
const createTransaction = require('../utils/tnx');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const moment = require('moment-timezone');
const DailyMining = require('../models/dailyMiningModel');
const Company = require('../models/companyModel');
const companyId = process.env.COMPANY_ID;

// start mining
exports.startMining = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user._id).select(
		'full_name email  is_mining'
	);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find mining by user id
	const mining = await Mining.findOne({ user_id: user._id });
	if (!mining) {
		return next(new ErrorHandler('Mining not found', 404));
	}
	console.log('mining', mining);

	// update mining
	mining.is_start = true;
	mining.is_active = true;
	await mining.save();

	// find company
	const company = await Company.findById(companyId);
	company.mining.total_ming_users += 1;
	await company.save();

	res.status(200).json({
		success: true,
		message: 'Mining started',
	});
});

// my mining
exports.myMining = catchAsyncErrors(async (req, res, next) => {
	// console.log('my mining', req.user._id);
	const user = await User.findById(req.user._id).select(
		'name email mining_balance total_members parent_1 parent_2 parent_3 is_mining'
	);
	if (!user) {
		return next(new ErrorHandler('User not found', 404));
	}

	// find mining by user id
	const mining = await Mining.findOne({ user_id: user._id });
	if (!mining) {
		return next(new ErrorHandler('Mining not found', 404));
	}

	res.status(200).json({
		success: true,
		mining,
	});
});

// cron job for 30s
// cron.schedule('* * * * *', async () => {
// 	const mining = await Mining.find({ is_active: true, is_start: true }).select(
// 		'total_sped_amount mining_balance email mining_time'
// 	);
// 	// console.log('mining', mining);
// 	console.log((0.2 / 3600) * 60);
// 	if (mining.length > 0) {
// 		mining.forEach(async (m) => {
// 			// update mining balance
// 			// console.log('email', m.email, 'Speed', m.total_sped_amount);
// 			m.mining_balance += (m.total_sped_amount / 3600) * 60;
// 			m.mining_time += 1;
// 			if (m.mining_time === 5) {
// 				m.is_start = false;
// 				m.is_active = false;
// 			}
// 			console.log(
// 				'email',
// 				m.email,
// 				'Balance',
// 				m.mining_balance,
// 				'Time',
// 				m.mining_time
// 			);
// 			await m.save();
// 		});
// 	}
// });

cron.schedule('* * * * *', async () => {
	const miningRecords = await Mining.find({
		is_start: true,
	});
	// console.log('miningRecords', miningRecords.length);

	if (miningRecords.length > 0) {
		const bulkOps = [];
		let totalMiningTimeIncrement = 0;

		for (const m of miningRecords) {
			const updatedMining = {
				mining_balance: m.mining_balance + (m.start_speed / 3600) * 60,
				mining_time: m.mining_time - 1,
				daily_mining_balance:
					m.daily_mining_balance + (m.start_speed / 3600) * 60,
			};

			// console.log(updatedMining);
			// console.log(m);

			if (updatedMining.mining_time === 0) {
				// find update Daily mining
				const dailyMining = await Mining.findOne({ _id: ObjectId(m._id) });
				dailyMining.is_start = false;
				dailyMining.mining_time = 1440;
				await dailyMining.save();
				console.log('Stop mining', dailyMining.username);
				// create daily mining record
				const record = await DailyMining.create({
					user_id: dailyMining.user_id,
					email: dailyMining.email,
					daily_mining_balance:
						dailyMining.daily_mining_balance +
						(dailyMining.start_speed / 3600) * 60,
					speed: dailyMining.start_speed,
					date: new Date(),
				});

				// find company
				const company = await Company.findById(companyId);
				company.target.mining -= dailyMining.daily_mining_balance;
				company.mining.total_ming_amount += dailyMining.daily_mining_balance;
				company.mining.total_ming_users -= 1;
				await company.save();

				const updatedFields = {
					is_start: false,
					daily_mining_balance: 0,
					mining_time: 1440,
				};

				bulkOps.push({
					updateOne: {
						filter: { _id: ObjectId(m._id) },
						update: {
							$set: {
								...updatedMining,
								...updatedFields,
								total_mining_time: m.total_mining_time + 1440,
							},
						},
					},
				});

				totalMiningTimeIncrement += 5;
			} else {
				bulkOps.push({
					updateOne: {
						filter: { _id: ObjectId(m._id) },
						update: { $set: updatedMining },
					},
				});
			}
		}

		if (bulkOps.length > 0) {
			await Mining.bulkWrite(bulkOps);
		}
	}
});

// create daily mining record
exports.createDailyMining = catchAsyncErrors(async (req, res, next) => {
	const currentDatetime = new Date();
	const options = { timeZone: 'Asia/Dhaka' };
	const nyCurrentTime = currentDatetime.toLocaleString('en-US', options);
	// get current time
	const time = nyCurrentTime.split(',')[1];
	// get current hour
	const currentHour = time.split(':')[0];
	// get current minute
	const currentMinute = time.split(':')[1];
	// get current second
	const currentSecond = time.split(':')[2];

	console.log(currentHour, ':', currentMinute, ':', currentSecond);

	// find all is_start = true minings
	const miningRecords = await Mining.find({ is_start: true }).select(
		'email user_id mining_balance total_sped_amount'
	);
	console.log('miningRecords', miningRecords);

	// create daily mining record
	for (const m of miningRecords) {
		const dailyMining = await DailyMining.create({
			user_id: m.user_id,
			email: m.email,
			daily_mining_balance: m.mining_balance,
			speed: m.total_sped_amount,
			date: nyCurrentTime,
		});
		console.log('Record', dailyMining);
	}

	console.log('cron job started');

	res.status(200).json({
		success: true,
		message: 'Daily mining record created successfully',
	});
});

// find all mining parents by parents[]
exports.findAllMiningParents = catchAsyncErrors(async (req, res, next) => {
	const { id } = req.params;

	const mining = await Mining.findOne({ _id: id });
	// console.log(mining.parents);
	const parents = await Mining.find({
		_id: { $in: mining.parents },
	});

	// reverse parents array
	const miningParents = parents.reverse();

	for (let i = 0; i < miningParents.length; i++) {
		if (i === 0) {
			// find parent 1 and update mining speed
			const parent1 = await Mining.findOne({ _id: miningParents[i] }).select(
				'speed_up member_count email total_sped_amount'
			);
			console.log('parent1', parent1.email);
			console.log('parent1', (parent1.total_sped_amount -= 0.2 * 0.2));
			console.log('parent1', (parent1.member_count.level_1 -= 1));
			await parent1.save();
		} else if (i === 1) {
			// find parent 2 and update mining speed
			const parent2 = await Mining.findOne({ _id: miningParents[i] }).select(
				'speed_up member_count email total_sped_amount'
			);
			console.log('parent1', parent2.email);
			console.log('parent2', (parent2.total_sped_amount -= 0.2 * 0.1));
			console.log('parent2', (parent2.member_count.level_2 -= 1));
			await parent2.save();
		} else if (i === 2) {
			// find parent 3 and update mining speed
			const parent3 = await Mining.findOne({ _id: miningParents[i] }).select(
				'speed_up member_count email total_sped_amount'
			);
			console.log('parent1', parent3.email);
			console.log('parent3', (parent3.total_sped_amount -= 0.2 * 0.05));
			console.log('parent3', (parent3.member_count.level_3 -= 1));
			await parent3.save();
		}
	}

	res.status(200).json({
		success: true,
		data: miningParents,
	});
});

// update all mining timing
exports.updateAllMiningTiming = catchAsyncErrors(async (req, res, next) => {
	const minings = await Mining.find();

	for (const m of minings) {
		m.mining_time = 2;
		await m.save();
	}

	res.status(200).json({
		success: true,
		message: 'All mining timing updated successfully',
	});
});

// get logged in user daily mining records
exports.getLoggedInUserDailyMiningRecords = catchAsyncErrors(
	async (req, res, next) => {
		const { id } = req.params;

		const dailyMiningRecords = await DailyMining.find({ user_id: id });

		res.status(200).json({
			success: true,
			dailyMiningRecords,
		});
	}
);
