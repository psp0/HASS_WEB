<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HASS</title>
    <link rel="stylesheet" type="text/css" href="/assets/css/style.css">
    <style>
        a{
    text-decoration: none;
    color: #000000;
}

        .login-button {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .login-button:hover {
            background-color: #0056b3;
        }
        .icon-button {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: #333;
            margin-left: 20px;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            justify-content: center;
            align-items: center;
            background-color: #e0e0e0;
            transition: background-color 0.3s;
        }
        .icon-button:hover {
            background-color: #d0d0d0; 
        }
        .button-container {
            display: flex;
            align-items: center; 
        }
    </style>
</head>
<body>
<header>
        <h1><a href="<?php echo TEAM_PATH; ?>/index.php">HASS</a></h1>
        <a href="<?php echo TEAM_PATH; ?>/pages/customer/model/air_cleaner.php" class="icon-button">공기청정기 구독</a>           
        <a href="<?php echo TEAM_PATH; ?>/pages/customer/model/dryer.php" class="icon-button">건조기 구독</a>           
        <a href="<?php echo TEAM_PATH; ?>/pages/customer/model/tv.php" class="icon-button">TV 구독</a>           
        <a href="<?php echo TEAM_PATH; ?>/pages/customer/model/washing_machine.php" class="icon-button">세탁기 구독</a>           
        <div class="button-container">
            <a href="<?php echo TEAM_PATH; ?>/pages/login/customer_login.php" class="login-button">로그인</a>
            <a href="<?php echo TEAM_PATH; ?>/pages/customer/my_info/my_info.php" class="icon-button" title="나의 정보">          
                <span>👤</span>           
            </a>
        </div>
    </header>
    <div class="main-content">
