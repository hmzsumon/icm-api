module.exports = function securityTemplate(name, code) {
	return `
<html>
	<head>
		<meta charset="utf-8" />
		<title>Express Life Security Verification</title>
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
				background-color: black;
				color: white;
				padding: 30px 10px;
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
				color: #00ff00;
				text-align: center;
				margin: 15px 0;
			}
			.link {
				color: #348f00;
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
				<img
					src="https://res.cloudinary.com/dmtgf2yox/image/upload/v1711806399/logo_zuopkc.png"
					alt=""
					width="300"
				/>
			</div>
			<div class="content">
				<h3>Hello ${name},</h3>
				<p>
					You recently requested a security verification. Use the following
					code:
				</p>
				<p class="code">${code}</p>
				<p>
					This code is valid for 30 minutes. Please do not share it with anyone.
				</p>
				<p>After entering the code, you can proceed with your request.</p>
			</div>
			<div class="footer">
				<p>
					For security reasons, always make sure you're on the official IC
					Markets Partner website before entering any sensitive information.
				</p>
				<p class="p2">
					&copy; 2023
					<a class="link" href="icmarketspartner.com/"> IC Markets Partner</a>.
					All Rights Reserved.
				</p>
			</div>
		</div>
	</body>
</html>
`;
};
