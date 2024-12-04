<?php
session_start();
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<style>
    .c-main-content{
        display: flex;
        justify-content: center;
        
    }
    .myinfo-container {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        text-align: left;
        width: 400px;
    }

    .myinfo-container input {
        width: 100%;
        padding: 3px;
        margin: 5px 0;
        font-size: 13px;
    }

    .myinfo-container input[readonly] {
        cursor: not-allowed;
    }

    .myinfo-container button {
        padding: 5px;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        width: 48%;
    }

    .myinfo-container .submit-button {
        background-color: #007bff;
    }

    .myinfo-container .submit-button:hover {
        background-color: #0056b3;
    }

    .myinfo-container .delete-button {
        background-color: #f44336;
    }

    .myinfo-container .delete-button:hover {
        background-color: #d32f2f;
    }

    .button-container {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .error-message {
        color: red;
        font-size: 12px;
        margin: 3px 0;
        text-align: left;
    }

    .address-container {
        display: flex;
        flex-direction: column;
    }

    .address-container .postal-container {
        display: flex;
        align-items: center;
    }

    .postal-container input {
        margin-bottom: 5px;
        margin-right: 5px;
        flex-grow: 1;
    }

    .search-button {
        padding: 6px 8px;
        font-size: 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .search-button:hover {
        background-color: #0056b3;
    }

    .required {
        color: red;
        font-size: 14px;
        margin-left: -5px;
        vertical-align: super;
    }
    * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

</style>
<script src="https://ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<script>
    function confirmDelete() {
        if (confirm("정말로 회원 탈퇴하시겠습니까?")) {
            $.ajax({
                url: "confirmDelete.php",
                type: "POST",
                dataType: "json",
                success: function(response) {
                    alert(response.message);
                    if (response.status === 'success') {
                        location.href = '../../../index.php';
                    }
                }
            });            
        }
    }

    function openPostcode() {
        new daum.Postcode({
            oncomplete: function (data) {
                document.getElementById('postalCode').value = data.zonecode;
                document.getElementById('roadAddress').value = data.roadAddress;
            }
        }).open();
    }

</script>

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

$customer_id = '';
$customer_name = '';
$main_phone_number = '';
$sub_phone_number = '';
$street_address = '';
$detail_address = '';
$postal_code = '';

$queryA = "SELECT CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER 
            FROM CUSTOMER WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id)";
$stmtA = oci_parse($conn, $queryA);
oci_bind_by_name($stmtA, ':auth_id', $currentUserID);

if (oci_execute($stmtA)) {
    $row = oci_fetch_array($stmtA);
    if ($row) {
        $customer_id = $row['CUSTOMER_ID'];
        $customer_name = $row['CUSTOMER_NAME'];
        $main_phone_number = $row['MAIN_PHONE_NUMBER'];
        $sub_phone_number = $row['SUB_PHONE_NUMBER'];
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
?>


<div class="myinfo-container">
    <h3 style="text-align: center; margin-bottom: 20px;">회원정보 수정</h3>
    <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="POST">
        <label for="userID">ID</label>
        <input type="text" name="id" value="<?php echo htmlspecialchars($currentUserID); ?>" readonly>
        <label for="password">Password</label>
        <div class="error-message">영어+숫자+특수문자(! @ # $), 8자 이상.</div>
        <input type="password" name="password"
            pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}">
        <label for="name" >이름</label>
        <input type="text" name="name" value="<?php echo htmlspecialchars($customer_name); ?>">
        <label for="main_phone">메인 전화번호</label>
        <div class="error-message">ex) 010-xxxx-xxxx</div>
        <input type="text" name="main_phone" value="<?php echo htmlspecialchars($main_phone_number); ?>">
        <label for="sub_phone">예비 전화번호</label>
        <input type="text" name="sub_phone" value="<?php echo htmlspecialchars($sub_phone_number); ?>">

        <div class="address-container">
            <label for="postalCode">주소</label>
            <div class="postal-container">
                <input type="text" id="postalCode" name="postal_code" value="<?php echo htmlspecialchars($postal_code); ?>" readonly>
                <button type="button" class="search-button" onclick="openPostcode()">우편번호 검색</button>
            </div>
            <input type="text" id="roadAddress" name="road_address"  value="<?php echo htmlspecialchars($street_address); ?>" readonly>
            <input type="text" name="detail_address" value="<?php echo htmlspecialchars($detail_address); ?>">
        </div>

        <div class="button-container">
            <button type="submit" class="submit-button">수정하기</button>
            <button type="button" class="delete-button" onclick="confirmDelete()">회원 탈퇴하기</button>
        </div>
    </form>
</div>

<?php
include BASE_PATH . '/includes/footer.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {        
    $auth_id = $_POST['id'];
    $customer_name = $_POST['name'];
    $password = $_POST['password'] ?? '';
    $main_phone = $_POST['main_phone'] ?? '';
    $sub_phone = $_POST['sub_phone'] ?? '';
    $postal_code = $_POST['postal_code'] ?? '';
    $road_address = $_POST['road_address'] ?? '';
    $detail_address = $_POST['detail_address'] ?? '';
    $edited_date = date('Y-m-d');
        
    try {
        // 트랜잭션 시작
        oci_execute(oci_parse($conn, "BEGIN"));
        
        // 고객 테이블에 데이터 수정
        $queryC = "UPDATE CUSTOMER SET CUSTOMER_NAME = :customer_name, MAIN_PHONE_NUMBER = :main_phone, SUB_PHONE_NUMBER = :sub_phone, DATE_EDITED = TO_DATE(:edited_date, 'YYYY-MM-DD')
                WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :currentUserID)";
        $stmtC = oci_parse($conn, $queryC);
        oci_bind_by_name($stmtC, ':customer_name', $customer_name);
        oci_bind_by_name($stmtC, ':main_phone', $main_phone);
        oci_bind_by_name($stmtC, ':sub_phone', $sub_phone);
        oci_bind_by_name($stmtC, ':edited_date', $edited_date);
        oci_bind_by_name($stmtC, ':currentUserID', $currentUserID);
        $executeC = oci_execute($stmtC);
        
        // 고객 인증 정보 삽입
        if (!empty($password)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $queryD = "UPDATE CUSTOMER_AUTH SET AUTH_ID = :auth_id, PW_HASH = :hashed_password, DATE_EDITED = TO_DATE(:edited_date, 'YYYY-MM-DD') 
                        WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :currentUserID)";
            $stmtD = oci_parse($conn, $queryD);
            oci_bind_by_name($stmtD, ':currentUserID', $currentUserID);
            oci_bind_by_name($stmtD, ':auth_id', $auth_id);
            oci_bind_by_name($stmtD, ':edited_date', $edited_date);
            oci_bind_by_name($stmtD, ':hashed_password', $hashed_password);
            $executeD = oci_execute($stmtD);
        } else {
            $executeD = true;
        }
                
        // 고객 주소 삽입
        $queryE = "UPDATE CUSTOMER_ADDRESS SET STREET_ADDRESS = :road_address, DETAILED_ADDRESS = :detail_address, POSTAL_CODE = :postal_code 
                    WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :currentUserID)";
        $stmtE = oci_parse($conn, $queryE);
        oci_bind_by_name($stmtE, ':currentUserID', $currentUserID);
        oci_bind_by_name($stmtE, ':road_address', $road_address);
        oci_bind_by_name($stmtE, ':detail_address', $detail_address);
        oci_bind_by_name($stmtE, ':postal_code', $postal_code);
        $executeE = oci_execute($stmtE);
                    
        if ($executeC && $executeD && $executeE) {
            oci_commit($conn);
            $response = ['status' => 'success', 'message' => '회원정보가 성공적으로 수정되었습니다.'];
            echo "<script>alert('" . $response['message'] . "');</script>";
            echo "<script>location.href='my_info.php';</script>";
            exit;
        } else {
            oci_rollback($conn);
            $response = ['status' => 'error', 'message' => '회원정보 수정 중 오류가 발생했습니다.'];
            echo "<script>alert('" . $response['message'] . "');</script>";
            echo "<script>location.href='update_my_info.php';</script>";
            exit;
        }  
    } catch (Exception $e) {   
        oci_rollback($conn);
        $response = ['status' => 'error', 'message' => '예외 발생: ' . $e->getMessage()];
        echo "<script>alert('" . $response['message'] . "');</script>";
        echo "<script>location.href='update_my_info.php';</script>";
    }
}
oci_free_statement($stmtC);
if (isset($stmtD)) {
    oci_free_statement($stmtD);
}
oci_free_statement($stmtE);
oci_close($conn);
?>