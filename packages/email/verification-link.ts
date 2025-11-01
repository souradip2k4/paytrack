export function verificationLink(url: string) {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your account</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            background-color: #f4f4f4;
            color: #333333;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
        }
        .content {
            padding: 20px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
        }
        .link-text {
            display: block;
            margin-top: 20px;
            font-size: 14px;
            color: #555555;
        }
        .link-text a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="content">
            <h1 style="color: #333333; font-size: 24px;">Thank you for signing up.</h1>
            <p style="font-size: 16px;">Click on this button to verify your account:</p>
            <a href="${url}" class="button">Verify Account</a>
            <p class="link-text">
                Or, if the button above doesn't work, you can copy and paste this link into your browser:
                <a href="${url}" style="word-break: break-all;">${url}</a>
            </p>
        </div>
    </div>
</body>
</html>
`;
}
