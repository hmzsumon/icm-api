module.exports = function depositTemplate(name, amount, balance, tnx_id) {
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
				background-color: #ffffff;
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
				background-color: #f1f5f9;
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
				<h3>Your Deposit Successful</h3>
				<p>
					You have received an amount
					<span class="highlight">${amount} USDT</span>. Your current balance is
					<span class="highlight">${balance} USDT</span>. <br />
					<br />
					<span class="highlight" style="font-size: 16px; font-weight: bold"
						>Your transaction ID</span
					>
					<br />
					<span class="highlight">${tnx_id}</span>.
				</p>

				<p>
					Don't recognize this activity?
					<a href="https://Express Life.vercel.app/" class="link">Reset</a> your
					password and contact
					<a href="https://t.me/Express Life2020" class="link"
						>customer support</a
					>
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
					<a class="link" href="https://expresslife.uk">Express Life</a>. All
					Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>
`;
};
