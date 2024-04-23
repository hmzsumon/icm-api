const app = require('./app');
const cloudinary = require('cloudinary');
const connectDB = require('./config/db');
const http = require('http');
const server = http.createServer(app);
const socketIO = require('./socket');

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Uncaught Exception`);
	process.exit(1);
});

// Config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	require('dotenv').config({ path: 'backend/config/config.env' });
}

// database connection
connectDB();

//cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const httpServer = app.listen(process.env.PORT, () => {
	console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Use the same http server to listen for Socket.IO connections
socketIO.attach(httpServer);

global.io = socketIO;

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Unhandled Promise Rejection`);

	httpServer.close(() => {
		process.exit(1);
	});
});
