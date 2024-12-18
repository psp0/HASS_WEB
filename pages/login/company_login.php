<?php
require '../../config.php';
include BASE_PATH . '/includes/company_header.php';
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
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        text-decoration: none;
        font-size: 14px;
    }

    .login-button:hover {
        background-color: #0056b3;
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
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        flex: 1;
        margin: 0 5px;
    }

    .button-container button:hover {
        background-color: #0056b3;
    }
</style>

<div class="login-container">
    <div class="header-container">
        <h2>회사 로그인</h2>
        <a href="<?php echo TEAM_PATH; ?>/pages/login/customer_login.php" class="login-button">고객 로그인</a>
        <a href="<?php echo TEAM_PATH; ?>/pages/login/worker_login.php" class="login-button">기사 로그인</a>

    </div>

    <form action="company_login.php" method="POST">
        <input type="text" name="id" placeholder="ID" required>
        <input type="password" name="password" placeholder="Password" required>
        <div class="button-container">
            <button type="submit">로그인</button>
        </div>
    </form>
</div>


<?php
session_start();

$config = require '../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
(HOST={$config['host']})(PORT={$config['port']}))
(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $password = $_POST['password'];

    $query = "SELECT AUTH_ID, PW_HASH FROM COMPANY_AUTH WHERE AUTH_ID = :id";
    $stmt = oci_parse($conn, $query);
    oci_bind_by_name($stmt, ':id', $id);
    oci_execute($stmt);

    $row = oci_fetch_array($stmt, OCI_ASSOC);

    if ($row && password_verify($password, $row['PW_HASH'])) {
        $_SESSION['auth_id'] = $row['AUTH_ID'];
        $_SESSION['company_logged_in'] = true;
        $_SESSION['logged_in'] = true;
        $_SESSION['user_type'] = 'company';

        echo "<script>alert('로그인 되었습니다. 환영합니다!');</script>";
        echo "<script>location.href='" . TEAM_PATH . "/pages/company/main.php';</script>";
        exit;
    } else {
        echo "<script>alert('ID 또는 비밀번호가 잘못되었습니다.');</script>";
        echo "<script>location.href='company_login.php';</script>";
    }
    oci_free_statement($stmt);
}
oci_close($conn);
?>

<?php
include BASE_PATH . '/includes/footer.php';
?>