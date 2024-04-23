const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const treeNodeSchema = new Schema({
	value: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	left: {
		type: Schema.Types.ObjectId,
		ref: 'TreeNode',
	},
	right: {
		type: Schema.Types.ObjectId,
		ref: 'TreeNode',
	},
	parent: {
		type: Schema.Types.ObjectId,
		ref: 'TreeNode',
	},
	name: {
		type: String,
		required: true,
	},
});

const TreeNode = mongoose.model('TreeNode', treeNodeSchema);
module.exports = TreeNode;
