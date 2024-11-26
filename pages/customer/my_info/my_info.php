<?php
session_start();
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>마이 페이지</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .container {
            display: flex;
            flex-grow: 1;
            padding: 20px;
            gap: 20px;
        }
        .sidebar {
            width: 300px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .form-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .form-group label {
            width: 70px;
        }
        .form-group input[type="text"] {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .sidebar-button {
            padding: 8px 10px; 
            width: 100px;
            margin: 0 auto;
            border: none;
            border-radius: 4px;
            background-color: #4CAF50;
            color: white;
            cursor: pointer;
            display: flex;
            justify-content: center; 
            align-items: center;
            font-size: 14px; 
            text-decoration: none; 
            text-align: center;
        }
        .sidebar-button:hover {
            background-color: #45a049;
        }
        .content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .content-section {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
            flex-grow: 1;
        }
        .address-fields {
            display: flex;
            flex-direction: column; 
            gap: 10px; 
            margin-left: 80px; 
        }

        .address-fields input[type="text"] {
            width: 100%; 
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
    
        .sidebar input[type="text"], 
        .address-fields input[type="text"] {
            width: 100%; 
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box; 
        }
    </style>
</head>

<div class="container">
    <?php
    $config = require '../../../config.php'; 
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))"; 
    $conn = oci_connect($config['username'], $config['password'], $dsn,'UTF8');
        
    if(!$conn) {
        $e = oci_error();
        echo "<p class='error'>연결 실패: ".htmlspecialchars($e['message'])."</p>";
        exit;
    }

    if (!isset($_SESSION['auth_id']) || empty($_SESSION['auth_id'])) {
        echo "<script>alert('로그인이 필요합니다.');</script>";
        echo "<script>location.href='/2_team/2_team5/pages/login/customer_login.php';</script>";
    }

    $currentUserID = $_SESSION['auth_id'];
    $customer_name = '';
    $main_phone_number = '';
    $street_address = '';
    $detail_address = '';
    $postal_code = '';

    $queryA = "SELECT CUSTOMER_NAME, MAIN_PHONE_NUMBER  
                FROM CUSTOMER WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id)";
    $stmtA = oci_parse($conn, $queryA);
    oci_bind_by_name($stmtA, ':auth_id', $currentUserID);

    if (oci_execute($stmtA)) {
        $row = oci_fetch_array($stmtA);
        if ($row) {
            $customer_name = $row['CUSTOMER_NAME'];
            $main_phone_number = $row['MAIN_PHONE_NUMBER'];
        }
    } else {
        $e = oci_error($stmtA);
        die("<p class='error'>CUSTOMER_AUTH 데이터 가져오기 실패: " . htmlspecialchars($e['message']) . "</p>");
    }

    $queryB = "SELECT STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE
                FROM CUSTOMER_ADDRESS WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id)";
    $stmtB = oci_parse($conn, $queryB);
    oci_bind_by_name($stmtB, ':auth_id', $currentUserID);

    if (oci_execute($stmtB)) {
        $row = oci_fetch_array($stmtB);
        if ($row) {
            $street_address = $row['STREET_ADDRESS'];
            $detail_address = $row['DETAILED_ADDRESS'];
            $postal_code = $row['POSTAL_CODE'];
        }
    } else {
        $e = oci_error($stmtB);
        die("<p class='error'>CUSTOMER_ADDRESS 데이터 가져오기 실패: " . htmlspecialchars($e['message']) . "</p>");
    }
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_close($conn);
    ?>
</div>

<body>
    <div class="container">
        <div class="sidebar">
            <div class="form-group">
                <label for="name">ID</label>
                <input type="text" id="name" value="<?php echo htmlspecialchars($customer_name); ?>" readonly>
            </div>
            <div class="form-group">
                <label for="phone_number" >전화번호</label>
                <input type="text" id="main_phone_number" value="<?php echo htmlspecialchars($main_phone_number); ?>" readonly>
            </div>
            <div class="form-group">
                <label for="address">주소</label>
                <div class="address-fields">
                    <input type="text" id="postal_code" value="<?php echo htmlspecialchars($postal_code); ?>" readonly>
                    <input type="text" id="street_address" value="<?php echo htmlspecialchars($street_address); ?>" readonly>               
                    <input type="text" id="detail_address" value="<?php echo htmlspecialchars($detail_address); ?>" readonly>
                </div>
            </div>
            <a href="<?php echo TEAM_PATH; ?>/pages/customer/my_info/update_my_info.php" class="sidebar-button">회원정보 수정</a>
        </div>

        <div class="content">
            <div class="content-section">
                <h3>나의 구독</h3>
                <!-- 주석 내용을 여기에 추가 -->
            </div>
            <div class="content-section">
                <h3>나의 요청</h>
                <!-- 요청 내용을 여기에 추가 -->
            </div>
        </div>
    </div>
</body>
</html>

<?php
?>

<?php
include BASE_PATH . '/includes/footer.php';
?>