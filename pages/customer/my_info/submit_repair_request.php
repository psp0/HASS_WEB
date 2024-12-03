<?php
$config = require '../../../config.php';

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
(HOST={$config['host']})(PORT={$config['port']}))
(CONNECT_DATA=(SID={$config['sid']})))";

$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "연결 실패: " . htmlspecialchars($e['message']);
    exit;
}

if (!isset($_SESSION['auth_id']) || empty($_SESSION['auth_id'])) {
    echo "로그인이 필요합니다.";
    exit;
}

$auth_id = $_SESSION['auth_id'];

$preferred_datetime1 = isset($_POST['preferred_datetime1']) ? $_POST['preferred_datetime1'] : null;
$preferred_datetime2 = isset($_POST['preferred_datetime2']) ? $_POST['preferred_datetime2'] : null;
$symptom = isset($_POST['symptom']) ? $_POST['symptom'] : null;
$subscription_id = isset($_POST['subscription_id']) ? $_POST['subscription_id'] : null;

if (!$preferred_datetime1 || !$preferred_datetime2 || !$symptom || !$subscription_id) {
    echo "모든 필드를 입력해주세요.";
    exit;
}

$query = "SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':auth_id', $auth_id);

if (!oci_execute($stmt)) {
    $e = oci_error($stmt);
    echo "고객 정보 가져오기 실패: " . htmlspecialchars($e['message']);
    exit;
}

$row = oci_fetch_array($stmt, OCI_ASSOC);

if ($row) {
    $customer_id = $row['CUSTOMER_ID'];
} else {
    echo "사용자 정보를 찾을 수 없습니다.";
    exit;
}

date_default_timezone_set('Asia/Seoul');
$request_date = date('Y-m-d H:i:s');

$insert_request_query = "
    INSERT INTO REQUEST (
        REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, SUBSCRIPTION_ID
    ) VALUES (
        R_SEQ.NEXTVAL, '고장', '대기중', :symptom, TO_TIMESTAMP(:request_date, 'YYYY-MM-DD HH24:MI:SS'), :subscription_id
    )
";

$insert_request_stmt = oci_parse($conn, $insert_request_query);
oci_bind_by_name($insert_request_stmt, ':symptom', $symptom);
oci_bind_by_name($insert_request_stmt, ':request_date', $request_date);
oci_bind_by_name($insert_request_stmt, ':subscription_id', $subscription_id);

if (!oci_execute($insert_request_stmt)) {
    $e = oci_error($insert_request_stmt);
    echo "수리 신청 실패: " . htmlspecialchars($e['message']);
    exit;
}

$request_id_stmt = oci_parse($conn, "SELECT R_SEQ.CURRVAL AS LAST_REQUEST_ID FROM DUAL");
if (!oci_execute($request_id_stmt)) {
    $e = oci_error($request_id_stmt);
    echo "REQUEST_ID 가져오기 실패: " . htmlspecialchars($e['message']);
    exit;
}
$request_id_row = oci_fetch_assoc($request_id_stmt);
$request_id = $request_id_row['LAST_REQUEST_ID'];

$insert_preference_query = "
    INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, REQUEST_ID, PREFER_DATE) VALUES
    (RPD_SEQ.NEXTVAL, :request_id, TO_TIMESTAMP(:prefer_date, 'YYYY-MM-DD\"T\"HH24:MI'))
";

// 첫 번째 선호 날짜 
$insert_preference_stmt1 = oci_parse($conn, $insert_preference_query);
oci_bind_by_name($insert_preference_stmt1, ':request_id', $request_id);
oci_bind_by_name($insert_preference_stmt1, ':prefer_date', $preferred_datetime1);

if (!oci_execute($insert_preference_stmt1)) {
    $e = oci_error($insert_preference_stmt1);
    echo "선호 날짜 1 삽입 실패: " . htmlspecialchars($e['message']);
    exit;
}

// 두 번째 선호 날짜 
$insert_preference_stmt2 = oci_parse($conn, $insert_preference_query);
oci_bind_by_name($insert_preference_stmt2, ':request_id', $request_id);
oci_bind_by_name($insert_preference_stmt2, ':prefer_date', $preferred_datetime2);

if (!oci_execute($insert_preference_stmt2)) {
    $e = oci_error($insert_preference_stmt2);
    echo "선호 날짜 2 삽입 실패: " . htmlspecialchars($e['message']);
    exit;
}

oci_commit($conn);

echo "success";

oci_free_statement($stmt);
oci_free_statement($insert_request_stmt);
oci_free_statement($request_id_stmt);
oci_free_statement($insert_preference_stmt1);
oci_free_statement($insert_preference_stmt2);
oci_close($conn);
?>
