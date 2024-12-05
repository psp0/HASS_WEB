<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HASS - 회사</title>
    <link href="https://fonts.googleapis.com/css2?family=Leckerli+One&family=Inter:wght@400;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        .c-main-content {
            display: flex;
            justify-content: center;
            height: 85vh;
            align-items: center;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .c-header {
            flex-shrink: 0;
            height: 70px;
            background-color: white;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 0 20px;
        }

        .c-main-content {
            flex: 1;
            background-color: #f8f9fa;
            padding: 20px;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        .c-header-title {
            font-size: 36px;
            font-family: 'Leckerli One', sans-serif;
            font-weight: 600;
            color: black;
        }

        .c-header-title a:hover {
            color: #0056b3;
            text-shadow: 0 4px 8px rgba(0, 86, 179, 0.5);
        }

        .c-header-nav-button {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #0369a1;
            padding: 10px 20px;
            border-radius: 15px;
            background-color: rgb(235, 248, 255);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            margin: 0 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .c-header-nav-button:hover {
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
        }

        .c-header-nav-button:active {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .c-header-login-button,
        .c-header-logout-button {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            border: 2px solid rgb(37, 99, 235);
            color: white;
            background-color: rgb(37, 99, 235);
            transition: all 0.3s ease;
        }

        .c-header-login-button:hover,
        .c-header-logout-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .c-header-login-button:active,
        .c-header-logout-button:active {
            transform: scale(0.95);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .c-header-icon-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s ease, transform 0.3s ease;
            margin-left: 10px;
        }

        .c-header-icon-button:hover {
            background-color: #e0e0e0;
            transform: scale(1.1);
        }
    </style>
</head>

<body>
    <header class="c-header">
        <h1 class="c-header-title"><a href="<?php echo TEAM_PATH; ?>/pages/company/main.php">HASS</a></h1>
        <div class="c-header-nav-links">
            <a href="<?php echo TEAM_PATH; ?>/pages/company/expiration/expiration.php" class="c-header-nav-button">만료관리</a>
        </div>
        <div class="c-header-button-container">
            <?php
            session_start();
            if (isset($_SESSION['company_logged_in']) && $_SESSION['company_logged_in'] === true) {
                echo '<a href="' . TEAM_PATH . '/pages/login/logout.php" class="c-header-logout-button">로그아웃</a>';
            } else {
                echo '<a href="' . TEAM_PATH . '/pages/login/company_login.php" class="c-header-login-button">회사 로그인</a>';
            }
            ?>

        </div>
    </header>

    <div class="c-main-content">