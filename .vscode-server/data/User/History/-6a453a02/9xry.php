<style>
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
        }

        .login-button:hover {
            background-color: #45a049;
        }

        .login-container input {
            width: 90%;
            padding: 10px;
            margin: 10px 0;
            font-size: 14px;
        }

        .button-container {
            display: flex; 
            justify-content: space-between; 
            margin-top: 10px; 
            font-size: 14px;
        }

        .button-container button {
            padding: 8px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            flex: 1; 
            margin: 0 5px; 
        }

        .button-container button:hover {
            background-color: #45a049;
        }

        .signup-button {
            padding: 10px; 
            background-color: gray; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            text-decoration: none; 
            display: flex; 
            justify-content: center;
            align-items: center; 
            flex: 1; 
            margin: 0 5px; 
            font-size: 14px;
        }

        .signup-button:hover {
            background-color: #45a049; 
        }
    </style>
    
<?php
require '../../config.php';
include BASE_PATH . '/includes/company_header.php';
?>
    <div class="login-container">
        <div class="header-container">
            <h2>회사 로그인</h2>
           <a href="<?php echo TEAM_PATH; ?>/pages/login/customer_login.php" class="login-button">고객 로그인</a>
            <a href="<?php echo TEAM_PATH; ?>/pages/login/worker_login.php" class="login-button">기사 로그인</a>

        </div>

        <form action="pages/login/company_login.php" method="POST">
            <input type="text" name="id" placeholder="ID" required>
            <input type="password" name="password" placeholder="Password" required>
            <div class="button-container">
                <button type="submit">로그인</button>                
            </div>
        </form>
    </div>
    <?php
    include BASE_PATH . '/includes/footer.php';
?>