module.exports = function withdrawTemplate(name, amount, tnx_id) {
	return `
<html>
	<head>
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f6f6f6;
				margin: 0;
				padding: 0;
			}
			.container {
				max-width: 600px;
				margin: 20px auto;
				background-color: #f8fafc;
				border-radius: 15px;
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
				overflow: hidden;
			}
			.header {
				background-color: #075985;
				color: white;
				padding: 15px;
				text-align: center;
			}

			.content {
				padding: 20px;
			}
			.footer {
				background-color: #e6e6e6;
				padding: 10px 20px;
				font-size: small;
			}
			.code {
				font-size: 36px;
				color: #fbc02d;
				text-align: center;
				margin: 15px 0;
			}
			.link {
				color: #1e90ff;
				text-decoration: none;
			}
			.p2 {
				text-align: center;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1>Express Life Transaction</h1>
			</div>
			<div class="content">
				<p>Hello ${name},</p>
				<h3>Withdraw Successful</h3>
				<p>
					You have successfully requested to withdraw
					<span style="color: #166534"> ${amount}</span> from your account.<br />
					Your Transaction ID is
					<span style="color: #166534"> ${tnx_id} </span><br />
					Your withdrawal request will be processed please wait while we
					process.
				</p>

				<p>
					Don't recognize this activity?
					<a href="https://glomax.vercel.app/" class="link">Reset</a> your
					password and contact
					<a href="https://t.me/glomax2020" class="link">customer support</a>
					immediately.
				</p>
				<p>This is an automated message, please don't reply.</p>
			</div>
			<div class="footer">
				<p>
					For security reasons, always make sure you're on the official Express
					Life website before entering any sensitive information.
				</p>

				<p class="p2">
					&copy; 2023
					<a class="link" href="https://expresslife.uk"> Express Life </a>. All
					Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>
`;
};
