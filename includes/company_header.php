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

        .icon-button, .login-button {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            color: white;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            cursor: pointer;
        }

        .icon-button {
            background-color: #007bff; 
            margin-left: 20px;
        }

        .icon-button:hover {
            background-color: #0056b3;
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
        }

        .login-button {
            background-color: #28a745; 
        }

        .login-button:hover {
            background-color: #218838;
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
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
        <a href="<?php echo TEAM_PATH; ?>/pages/company/main.php" class="icon-button">회사 메인</a>           
        <a href="<?php echo TEAM_PATH; ?>/pages/company/expiration/expiration.php" class="icon-button">만료관리</a>       
        <div class="button-container">        
        <?php
            session_start();
            if (isset($_SESSION['company_logged_in']) && $_SESSION['company_logged_in'] === true) {
                echo '<a href="' . TEAM_PATH . '/pages/login/logout.php" class="logout-button">로그아웃</a>';
            } else {
                echo '<a href="' . TEAM_PATH . '/pages/login/company_login.php" class="login-button">회사 로그인</a>';
            }
            ?>   
        </div>
    </header>
    <div class="main-content">
     
