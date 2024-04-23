const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const {
	createDeposit,
	getUserDeposits,
	getAllDeposits,
	deleteAllPendingDeposits,
	getSingleDeposit,
	approveDeposit,
	rejectDeposit,
	addDepositMethod,
	getAllDepositMethods,
	activeDepositMethod,
	getActiveDepositMethod,
} = require('../controllers/depositController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const upload = multer({});

const storage = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			return cb(res.status(400).end('only jpg, png, jpeg is allowed'), false);
		}
		cb(null, true);
	},
});
// get all deposits
router.get(
	'/admin/deposits',
	isAuthenticatedUser,
	authorizeRoles('admin', 'owner'),
	getAllDeposits
);
router.post('/new/deposit', isAuthenticatedUser, createDeposit);
router.get('/deposits/me', isAuthenticatedUser, getUserDeposits);

// delete all pending deposits
router.delete('/deposit/delete/pending', deleteAllPendingDeposits);

// get single deposit
router.get('/deposit/:id', isAuthenticatedUser, getSingleDeposit);

// approve deposit
router.put(
	'/deposit/approve/:id',
	upload.none(),
	isAuthenticatedUser,
	authorizeRoles('admin', 'owner'),
	approveDeposit
);

// reject deposit
router.put(
	'/deposit/reject',
	upload.none(),
	isAuthenticatedUser,
	authorizeRoles('admin', 'owner'),
	rejectDeposit
);

// get all deposit methods
router.get('/deposit-methods', getAllDepositMethods);

// add deposit method
router.post('/add-deposit-method', isAuthenticatedUser, addDepositMethod);

// active deposit method

router.put(
	'/deposit-method/active/:id',
	isAuthenticatedUser,
	activeDepositMethod
);

// get active deposit method
router.get('/deposit-method/active', getActiveDepositMethod);

module.exports = router;
