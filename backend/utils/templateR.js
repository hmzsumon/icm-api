module.exports = function registrationTemplate(name, code) {
	return `

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Registration Verification</title>
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
					You're almost there! To complete your registration, please use the
					following verification code:
				</p>
				<p class="code">
					<strong>${code}</strong>
				</p>
				<p>
					This verification code will remain valid for 30 minutes. Please do not
					share this code with anyone.
				</p>
				<p>After entering the code, you'll be able to set up your account.</p>
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
