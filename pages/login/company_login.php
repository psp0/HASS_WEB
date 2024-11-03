<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회사 로그인</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
        }

        .login-container {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 400px;
        }

        .header-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }

        .header-container h2 {
            margin: 0;
            font-size: 24px;
        }

        .login-button {
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            font-size: 14px;
            cursor: pointer;
        }

        .login-button:hover {
            background-color: #45a049;
        }

        .login-container input {
            width: 90%;
            padding: 10px;
            margin: 10px 0;
            font-size: 16px;
        }

        .login-container button {
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 50%;
            margin-top: 10px;
        }

        .login-container button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>

    <div class="login-container">
        <div class="header-container">
            <h2>회사 로그인</h2>
            <a href="pages/login/login_main.php" class="login-button">고객 로그인</a>
            <a href="pages/login/worker_login.php" class="login-button">기사 로그인</a>
        </div>

        <form action="pages/login/company_login.php" method="POST">
            <input type="text" name="id" placeholder="ID" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">로그인</button>
        </form>
    </div>
</body>
</html>
