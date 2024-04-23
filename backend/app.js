const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const http = require('http');

const errorMiddleware = require('./middleware/error');

// Config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	require('dotenv').config({ path: 'backend/config/config.env' });
}

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

// Route Imports
const company = require('./routes/companyRoute');
const user = require('./routes/userRoute');
const mining = require('./routes/miningRoute');
const deposit = require('./routes/depositRoute');
const notification = require('./routes/notificationRoute');
const transaction = require('./routes/transactionRoute');
const userNotification = require('./routes/userNotificationRoute');
const withdraw = require('./routes/withdrawRoute');
const admin = require('./routes/adminRoute');
const owner = require('./routes/ownerRoute');

// Middleware for Errors
app.use('/api/v1', company);
app.use('/api/v1', user);
app.use('/api/v1', mining);
app.use('/api/v1', deposit);
app.use('/api/v1', notification);
app.use('/api/v1', transaction);
app.use('/api/v1', userNotification);
app.use('/api/v1', withdraw);
app.use('/api/v1', admin);
app.use('/api/v1', owner);

// test route for server
app.get('/', (req, res) => {
	const data = {
		server_time: Date(Date.now()),
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		server_mode: process.env.NODE_ENV,
		server_port: process.env.PORT,
		root_url: req.protocol + '://' + req.get('host'),
	};
	res.status(200).json({
		success: true,
		data,
	});
});

app.use(errorMiddleware);

module.exports = app;
