<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HASS - 기사</title>
    <link href="https://fonts.googleapis.com/css2?family=Leckerli+One&family=Inter:wght@400;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    <style>
        .w-main-content {
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

        .w-header {
            flex-shrink: 0;
            height: 70px;
            background-color: white;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 0 20px;
        }

        .w-main-content {
            flex: 1;
            background-color: #f8f9fa;
            padding: 20px;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        .w-header-title {
            font-size: 36px;
            font-family: 'Leckerli One', sans-serif;
            font-weight: 600;
            color: black;
        }

        .w-header-title a:hover {
            color: #0056b3;
            text-shadow: 0 4px 8px rgba(0, 86, 179, 0.5);
        }

        .w-header-nav-button {
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

        .w-header-nav-button:hover {
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
        }

        .w-header-nav-button:active {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .w-header-login-button,
        .w-header-logout-button {
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

        .w-header-login-button:hover,
        .w-header-logout-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .w-header-login-button:active,
        .w-header-logout-button:active {
            transform: scale(0.95);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .w-header-icon-button {
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

        .w-header-icon-button:hover {
            background-color: #e0e0e0;
            transform: scale(1.1);
        }
    </style>
</head>

<body>
    <header class="w-header">
        <h1 class="w-header-title"><a href="<?php echo TEAM_PATH; ?>/pages/worker/main.php">HASS</a></h1>
        <div class="w-header-nav-links">
            <a href="<?php echo TEAM_PATH; ?>/pages/worker/product/product.php" class="w-header-nav-button">제품 관리</a>
            <a href="<?php echo TEAM_PATH; ?>/pages/worker/request/request.php" class="w-header-nav-button">요청 관리</a>
        </div>
        <div class="w-header-button-container">
            <?php
            if (isset($_SESSION['worker_logged_in']) && $_SESSION['worker_logged_in'] === true) {
                echo '<a href="' . TEAM_PATH . '/pages/login/logout.php" class="w-header-logout-button">로그아웃</a>';
            } else {
                echo '<a href="' . TEAM_PATH . '/pages/login/worker_login.php" class="w-header-login-button">기사 로그인</a>';
            }
            ?>
        </div>
    </header>

    <div class="w-main-content">