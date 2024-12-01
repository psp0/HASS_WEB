<?php
$config = require '../../../config.php';
header('Content-Type: application/json');


$input = file_get_contents('php://input');
$data = json_decode($input, true);


if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => '유효하지 않은 요청 데이터입니다.'
    ]);
    exit;
}

$request_id = $data['request_id'] ?? null;
$request_type = $data['request_type'] ?? null;


if (!$request_id || !$request_type) {
    echo json_encode([
        'success' => false,
        'message' => '요청 ID 또는 요청 타입 데이터가 누락되었습니다.'
    ]);
    exit;
}


$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))";

$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo json_encode([
        'success' => false,
        'message' => '데이터베이스 연결에 실패했습니다.',
        'error' => $e['message']
    ]);
    exit;
}


if (!isset($_SESSION['auth_id']) || empty($_SESSION['auth_id'])) {
    echo json_encode([
        'success' => false,
        'message' => '로그인이 필요합니다.'
    ]);
    oci_close($conn);
    exit;
}

$currentUserID = $_SESSION['auth_id'];


$queryCustomerID = "SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
$stmtCustomerID = oci_parse($conn, $queryCustomerID);
oci_bind_by_name($stmtCustomerID, ':auth_id', $currentUserID);
if (!oci_execute($stmtCustomerID)) {
    $e = oci_error($stmtCustomerID);
    echo json_encode([
        'success' => false,
        'message' => '고객 ID 조회에 실패했습니다.',
        'error' => $e['message']
    ]);
    oci_free_statement($stmtCustomerID);
    oci_close($conn);
    exit;
}

$row = oci_fetch_array($stmtCustomerID, OCI_ASSOC);
$customer_id = $row['CUSTOMER_ID'] ?? null;
oci_free_statement($stmtCustomerID);

if (!$customer_id) {
    echo json_encode([
        'success' => false,
        'message' => '고객 ID를 찾을 수 없습니다.'
    ]);
    oci_close($conn);
    exit;
}

$owner_query = "
    SELECT TRIM(r.REQUEST_STATUS) AS REQUEST_STATUS, r.SUBSCRIPTION_ID
    FROM REQUEST r
    JOIN SUBSCRIPTION s ON r.SUBSCRIPTION_ID = s.SUBSCRIPTION_ID
    WHERE r.REQUEST_ID = :request_id AND s.CUSTOMER_ID = :customer_id
";

$stmt_owner = oci_parse($conn, $owner_query);
oci_bind_by_name($stmt_owner, ':request_id', $request_id);
oci_bind_by_name($stmt_owner, ':customer_id', $customer_id);

if (!oci_execute($stmt_owner)) {
    $e = oci_error($stmt_owner);
    echo json_encode([
        'success' => false,
        'message' => 'REQUEST 소유자 확인에 실패했습니다.',
        'error' => $e['message']
    ]);
    oci_free_statement($stmt_owner);
    oci_close($conn);
    exit;
}

$row_owner = oci_fetch_array($stmt_owner, OCI_ASSOC);
$request_status = $row_owner['REQUEST_STATUS'] ?? null;
$subscription_id = $row_owner['SUBSCRIPTION_ID'] ?? null;
oci_free_statement($stmt_owner);

if (!$request_status) {
    echo json_encode([
        'success' => false,
        'message' => '요청을 찾을 수 없습니다.'
    ]);
    oci_close($conn);
    exit;
}

if ($request_status !== '대기중') {
    echo json_encode([
        'success' => false,
        'message' => '취소할 수 있는 상태가 아닙니다.'
    ]);
    oci_close($conn);
    exit;
}

// REQUEST_PREFERENCE_DATE 삭제
$delete_pref_query = "
    DELETE FROM REQUEST_PREFERENCE_DATE
    WHERE REQUEST_ID = :request_id
";
$stmt_del_pref = oci_parse($conn, $delete_pref_query);
oci_bind_by_name($stmt_del_pref, ':request_id', $request_id);

if (!oci_execute($stmt_del_pref, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($stmt_del_pref);
    echo json_encode([
        'success' => false,
        'message' => 'REQUEST_PREFERENCE_DATE 삭제 중 오류가 발생했습니다.',
        'error' => $e['message']
    ]);
    oci_free_statement($stmt_del_pref);
    oci_rollback($conn);
    oci_close($conn);
    exit;
}
oci_free_statement($stmt_del_pref);

// REQUEST 삭제
$delete_req_query = "
    DELETE FROM REQUEST 
    WHERE REQUEST_ID = :request_id
";
$stmt_del_req = oci_parse($conn, $delete_req_query);
oci_bind_by_name($stmt_del_req, ':request_id', $request_id);

if (!oci_execute($stmt_del_req, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($stmt_del_req);
    echo json_encode([
        'success' => false,
        'message' => 'REQUEST 삭제 중 오류가 발생했습니다.',
        'error' => $e['message']
    ]);
    oci_free_statement($stmt_del_req);
    oci_rollback($conn);
    oci_close($conn);
    exit;
}
oci_free_statement($stmt_del_req);

// REQUEST_TYPE이 '설치'인 경우, SUBSCRIPTION도 삭제
if ($request_type === '설치') {
    $delete_sub_query = "
        DELETE FROM SUBSCRIPTION 
        WHERE SUBSCRIPTION_ID = :subscription_id
    ";
    $stmt_del_sub = oci_parse($conn, $delete_sub_query);
    oci_bind_by_name($stmt_del_sub, ':subscription_id', $subscription_id);

    if (!oci_execute($stmt_del_sub, OCI_NO_AUTO_COMMIT)) {
        $e = oci_error($stmt_del_sub);
        echo json_encode([
            'success' => false,
            'message' => 'SUBSCRIPTION 삭제 중 오류가 발생했습니다.',
            'error' => $e['message']
        ]);
        oci_free_statement($stmt_del_sub);
        oci_rollback($conn);
        oci_close($conn);
        exit;
    }
    oci_free_statement($stmt_del_sub);
}

// 커밋
if (!oci_commit($conn)) {
    $e = oci_error($conn);
    echo json_encode([
        'success' => false,
        'message' => '트랜잭션 커밋 중 오류가 발생했습니다.',
        'error' => $e['message']
    ]);
    oci_rollback($conn);
    oci_close($conn);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => '요청이 성공적으로 취소되었습니다.'
]);

oci_close($conn);
exit;
?>
