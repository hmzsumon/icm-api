const User = require('../models/userModel');

const generateUniqueId = async () => {
	const defaultId = 202000;
	let attempt = 0;
	while (true) {
		const userCount = await User.countDocuments({
			role: 'user',
		});
		const newId = defaultId + userCount + attempt;
		const existingUser = await User.findOne({ partner_id: newId });
		if (!existingUser) {
			return newId; // Unique ID found
		}
		attempt++; // Increment attempt in case of collision
	}
};

module.exports = {
	generateUniqueId,
};
