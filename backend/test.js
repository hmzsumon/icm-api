// var today = new Date();
// var tomorrow = new Date();
// tomorrow.setDate(today.getDate() + 2);
// console.log(tomorrow.toDateString());

// const currentTime = new Date().toLocaleString().split(',')[1].trim();
// console.log(currentTime);

// cerate user 9 digit customer id
// function generateUniqueId() {
// 	const timestamp = new Date().getTime().toString();
// 	console.log(timestamp);
// 	const random = Math.floor(Math.random() * 100000000)
// 		.toString()
// 		.padStart(9, '0');
// 	console.log(random);
// 	return timestamp + random;
// }

// console.log(generateUniqueId().substring(0, 12));
// const crypto = require('crypto');

// function generateUniqueID() {
// 	const bytes = crypto.randomBytes(4); // Generate 4 random bytes
// 	const id = parseInt(bytes.toString('hex'), 16).toString().substr(0, 9); // Convert to hex, then to number string, and take first 9 digits
// 	return id;
// }

// console.log(generateUniqueID());

const defaultId = 202000;
const createUniqueId = (id) => {
	const newId = defaultId + id;
	return newId;
};

console.log(createUniqueId(1));
console.log(createUniqueId(2));
console.log(createUniqueId(3));
console.log(createUniqueId(4));
console.log(createUniqueId(5));
