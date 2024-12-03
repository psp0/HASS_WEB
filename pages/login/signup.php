<?php
ob_start();
require '../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

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

    .signup-container {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        text-align: left;
        width: 400px;
    }

    .signup-container input {
        width: 97%;
        padding: 3px;
        margin: 5px 0;
        font-size: 13px;
    }

    .signup-container button {
        padding: 5px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        width: 50%;
        margin: 10px auto;
        display: block;
    }

    .signup-container button:hover {
        background-color: #45a049;
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
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .search-button:hover {
        background-color: #45a049;
    }

    .duplicate-check-button {
        padding: 4px;
        font-size: 12px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 10px;
    }

    .duplicate-check-button:hover {
        background-color: #1976D2;
    }

    .postal-container {
        display: flex;
        align-items: center;
    }

    .required {
        color: red;
        font-size: 14px;
        margin-left: -5px;
        vertical-align: super;
    }
</style>

<div class="signup-container">
        <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="POST">
            <label for="userID">ID <span class="required">*</span></label>
            <div class="postal-container">
                <input type="text" name="id">
                <button type="button" class="duplicate-check-button" onclick="checkDuplicate()">중복확인</button>
            </div>
            <label for="password">Password <span class="required">*</span></label>
            <div class="error-message">영어+숫자+특수문자(! @ # $), 8자 이상.</div>
            <input type="password" name="password" required
                pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}">
            <label for="name">이름 <span class="required">*</span></label>
            <input type="text" name="name" required>
            <label for="main_phone">메인 전화번호 <span class="required">*</span></label>
            <div class="error-message">ex) 010-xxxx-xxxx</div>
            <input type="text" name="main_phone" required>
            <label for="sub_phone">예비 전화번호</label>
            <input type="text" name="sub_phone">

            <div class="address-container">
                <label for="postalCode">주소 <span class="required">*</span></label>
                <div class="postal-container">
                    <input type="text" id="postalCode" name="postal_code" required readonly>
                    <button type="button" class="search-button" onclick="openPostcode()">우편번호 검색</button>
                </div>
                <input type="text" id="roadAddress" name="road_address" required readonly>
                <input type="text" name="detail_address" placeholder="상세 주소" required>
            </div>
            <button type="submit">회원가입</button>
        </form>
        <script src="https://ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    </div>

<script>
    function openPostcode() {
        new daum.Postcode({
            oncomplete: function (data) {
                document.getElementById('postalCode').value = data.zonecode;
                document.getElementById('roadAddress').value = data.roadAddress;
            }
        }).open();
    }

    function checkDuplicate() {
        var userID = document.querySelector('input[name="id"]').value;

        $.ajax({
            url: "check_duplicate.php", // 서버에 중복확인 요청을 보낼 PHP 파일
            type: "POST",
            data: { id: userID },
            success: function (response) {

                var resultElement = document.getElementById("checkResult");

                if (!resultElement) {
                    resultElement = document.createElement("div");
                    resultElement.id = "checkResult";
                    resultElement.style.fontSize = "0.8em";
                    resultElement.style.marginTop = "5px";

                    // 메시지 위치 안고쳐짐.
                    document.querySelector('input[name="id"]').after(resultElement);
                }

                if (response === "exists") {
                    //alert("이미 사용 중인 ID입니다.");
                    resultElement.textContent = "중복된 ID입니다.";
                    resultElement.style.color = "red";
                } else if (response === "available") {
                    //alert("사용 가능한 ID입니다.");
                    resultElement.textContent = "사용 가능한 ID입니다!";
                    resultElement.style.color = "blue";
                }
            }
        });
    }
</script>

<?php
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
    
$response = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $auth_id = $_POST['id'] ?? '';
    $password = $_POST['password'] ?? '';
    $customer_name = $_POST['name'] ?? '';
    $main_phone = $_POST['main_phone'] ?? '';
    $sub_phone = $_POST['sub_phone'] ?? '';
    $postal_code = $_POST['postal_code'] ?? '';
    $road_address = $_POST['road_address'] ?? '';
    $detail_address = $_POST['detail_address'] ?? '';
    $created_date = date('Y-m-d');
    $options = [ 'cost' => 12, ];
    $hashed_password = password_hash($password, PASSWORD_BCRYPT, $options);
    
    try {
        // 트랜잭션 시작
        oci_execute(oci_parse($conn, "BEGIN"));

        // 고객 테이블에 데이터 삽입
        $queryA = "INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED)
                     VALUES (C_SEQ.NEXTVAL, :customer_name, :main_phone, :sub_phone, TO_DATE(:created_date, 'YYYY-MM-DD'))
                     RETURNING CUSTOMER_ID INTO :customer_id";
        $stmtA = oci_parse($conn, $queryA);
        oci_bind_by_name($stmtA, ':customer_id', $customer_id);
        oci_bind_by_name($stmtA, ':customer_name', $customer_name);
        oci_bind_by_name($stmtA, ':main_phone', $main_phone);
        oci_bind_by_name($stmtA, ':sub_phone', $sub_phone);
        oci_bind_by_name($stmtA, ':created_date', $created_date);
        $executeA = oci_execute($stmtA);

        // 고객 인증 정보 삽입
        $queryB = "INSERT INTO CUSTOMER_AUTH(CUSTOMER_ID, AUTH_ID, PW_HASH) VALUES (:customer_id, :auth_id, :hashed_password)";
        $stmtB = oci_parse($conn, $queryB);
        oci_bind_by_name($stmtB, ':customer_id', $customer_id);
        oci_bind_by_name($stmtB, ':auth_id', $auth_id);
        oci_bind_by_name($stmtB, ':hashed_password', $hashed_password);
        $executeB = oci_execute($stmtB);

        // 고객 주소 삽입
        $queryC = "INSERT INTO CUSTOMER_ADDRESS(CUSTOMER_ID, STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE)
                    VALUES (:customer_id, :road_address, :detail_address, :postal_code)";
        $stmtC = oci_parse($conn, $queryC);
        oci_bind_by_name($stmtC, ':customer_id', $customer_id);
        oci_bind_by_name($stmtC, ':road_address', $road_address);
        oci_bind_by_name($stmtC, ':detail_address', $detail_address);
        oci_bind_by_name($stmtC, ':postal_code', $postal_code);
        $executeC = oci_execute($stmtC);
            
        if ($executeA && $executeB && $executeC) {
            oci_commit($conn);
            $response = ['status' => 'success', 'message' => '회원가입이 완료되었습니다.'];
            echo "<script>alert('" . $response['message'] . "');</script>";
            echo "<script>location.href='customer_login.php';</script>";
        } else {
            oci_rollback($conn);
            $response = ['status' => 'error', 'message' => '회원가입 중 오류가 발생했습니다.'];
            echo "<script>alert('" . $response['message'] . "');</script>";
            echo "<script>location.href='signup.php';</script>";
        }
    } catch (Exception $e) {
        oci_rollback($conn);
        $response = ['status' => 'error', 'message' => '예외 발생: ' . $e->getMessage()];
        echo "<script>alert('" . $response['message'] . "');</script>";
        echo "<script>location.href='signup.php';</script>";
    } 
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_close($conn);
}
?>   

<?php
include BASE_PATH . '/includes/footer.php';
?>