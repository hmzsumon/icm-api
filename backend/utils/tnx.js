const Transaction = require('../models/transaction');

const createTransaction = async (
	user_id,
	transactionType,
	amount,
	purpose,
	description
) => {
	const transaction = new Transaction({
		user_id,
		transactionType,
		amount,
		purpose,
		description,
		isCashIn: transactionType === 'cashIn',
		isCashOut: transactionType === 'cashOut',
	});

	return await transaction.save();
};

module.exports = createTransaction;
