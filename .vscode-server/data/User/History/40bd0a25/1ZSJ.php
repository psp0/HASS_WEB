<div class="login-container">
        <?php
        session_start();

        $config = require 'config.php'; 
        $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
        (HOST={$config['host']})(PORT={$config['port']}))
        (CONNECT_DATA=(SID={$config['sid']})))";  
        $conn = oci_connect($config['username'], $config['password'], $dsn,'UTF8');
    
        if(!$conn) {
            $e = oci_error();
            echo "<p class='error'>연결 실패: ".htmlspecialchars($e['message'])."</p>";
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'];
            $password = $_POST['password'];

            $query = "SELECT AUTH_ID, PW_HASH FROM CUSTOMER_AUTH WHERE AUTH_ID = :id";
            $stmt = oci_parse($conn, $query);
            oci_bind_by_name($stmt, ':id', $id);
            oci_execute($stmt);

            $row = oci_fetch_array($stmt);

            if ($row && password_verify($password, $row['PW_HASH']))  {
                $_SESSION['auth_id'] = $row['AUTH_ID'];
                $_SESSION['logged_in'] = true;

                header('Location: index.php');
                exit;
            } else {
                echo "<p class='error'> ID 또는 비밀번호가 잘못되었습니다.</p>";
            }
            oci_free_statement($stmt);
        }
        oci_close($conn);
        ?>
    </div> 

<?php
require '../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

    <div class="login-container">
        <div class="header-container">
            <h2>고객 로그인</h2>
            <a href="<?php echo TEAM_PATH; ?>/pages/login/worker_login.php" class="login-button">기사 로그인</a>
            <a href="<?php echo TEAM_PATH; ?>/pages/login/company_login.php" class="login-button">회사 로그인</a>       
        </div>

        <form action="pages/login/login_main.php" method="POST">
            <input type="text" name="id" placeholder="ID" required>
            <input type="password" name="password" placeholder="Password" required>
            <div class="button-container">
                <button type="submit">로그인</button>
                <a href="signup.php" class="signup-button">회원가입</a>
            </div>
        </form>
    </div>

<?php
include BASE_PATH . '/includes/footer.php';
?>

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

    