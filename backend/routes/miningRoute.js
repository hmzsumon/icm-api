const express = require('express');
const multer = require('multer');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
	startMining,
	myMining,
	createDailyMining,
	findAllMiningParents,
	updateAllMiningTiming,
	getLoggedInUserDailyMiningRecords,
} = require('../controllers/miningController');
const router = express.Router();

// start mining
router
	.route('/start_mining/:id')
	.post(isAuthenticatedUser, authorizeRoles('user'), startMining);

// my mining
router
	.route('/my_mining')
	.get(isAuthenticatedUser, authorizeRoles('user'), myMining);

// create daily mining
router.route('/create_daily_mining').post(createDailyMining);

// find all mining parents
router.route('/find_all_mining_parents/:id').get(findAllMiningParents);

// update all mining timing
router.route('/update_all_mining_timing').put(updateAllMiningTiming);

// get logged in user daily mining records
router
	.route('/daily_mining_records/:id')
	.get(getLoggedInUserDailyMiningRecords);

module.exports = router;
