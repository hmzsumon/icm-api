const express = require('express');
const multer = require('multer');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const { seedOwners } = require('../controllers/ownerController');

router.route('/seed_owners').post(seedOwners);

module.exports = router;
