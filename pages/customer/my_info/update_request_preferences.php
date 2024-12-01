<?php
$config = require '../../../config.php';


$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))";

$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');


header('Content-Type: application/json');


if (!$conn) {
    $error = oci_error();
    echo json_encode([
        'success' => false,
        'message' => '데이터베이스 연결에 실패했습니다.',
        'error' => $error['message']
    ]);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => '잘못된 요청 방법입니다.'
    ]);
    oci_close($conn);
    exit;
}


$data = json_decode(file_get_contents('php://input'), true);


if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => '유효하지 않은 요청 데이터입니다.'
    ]);
    oci_close($conn);
    exit;
}

$request_id = $data['request_id'] ?? null;
$preferences = $data['preferences'] ?? [];

if (!$request_id || empty($preferences)) {
    echo json_encode([
        'success' => false,
        'message' => '요청 ID 또는 선호일자 데이터가 누락되었습니다.'
    ]);
    oci_close($conn);
    exit;
}


$currentUserID = $_SESSION['auth_id'] ?? null;
if (!$currentUserID) {
    echo json_encode([
        'success' => false,
        'message' => '로그인이 필요합니다.'
    ]);
    oci_close($conn);
    exit;
}

$query_customer = "SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
$stmt_customer = oci_parse($conn, $query_customer);

if (!$stmt_customer) {
    $error = oci_error($conn);
    echo json_encode([
        'success' => false,
        'message' => 'CUSTOMER_ID 쿼리 준비 실패.',
        'error' => $error['message']
    ]);
    oci_close($conn);
    exit;
}

oci_bind_by_name($stmt_customer, ':auth_id', $currentUserID);

if (!oci_execute($stmt_customer)) {
    $error = oci_error($stmt_customer);
    echo json_encode([
        'success' => false,
        'message' => 'CUSTOMER_ID 조회에 실패했습니다.',
        'error' => $error['message']
    ]);
    oci_free_statement($stmt_customer);
    oci_close($conn);
    exit;
}

$row_customer = oci_fetch_array($stmt_customer, OCI_ASSOC);
$customer_id = $row_customer['CUSTOMER_ID'] ?? null;
oci_free_statement($stmt_customer);

if (!$customer_id) {
    echo json_encode([
        'success' => false,
        'message' => '고객 ID를 찾을 수 없습니다.'
    ]);
    oci_close($conn);
    exit;
}

// 요청의 소유자인지 확인
$owner_query = "
    SELECT COUNT(*) AS CNT
    FROM REQUEST r
    JOIN SUBSCRIPTION s ON r.SUBSCRIPTION_ID = s.SUBSCRIPTION_ID
    WHERE r.REQUEST_ID = :request_id AND s.CUSTOMER_ID = :customer_id
";

$stmt_owner = oci_parse($conn, $owner_query);
if (!$stmt_owner) {
    $error = oci_error($conn);
    echo json_encode([
        'success' => false,
        'message' => 'OWNER 쿼리 준비 실패.',
        'error' => $error['message']
    ]);
    oci_close($conn);
    exit;
}

oci_bind_by_name($stmt_owner, ':request_id', $request_id);
oci_bind_by_name($stmt_owner, ':customer_id', $customer_id);

if (!oci_execute($stmt_owner)) {
    $error = oci_error($stmt_owner);
    echo json_encode([
        'success' => false,
        'message' => 'REQUEST 소유자 확인에 실패했습니다.',
        'error' => $error['message']
    ]);
    oci_free_statement($stmt_owner);
    oci_close($conn);
    exit;
}

$row_owner = oci_fetch_array($stmt_owner, OCI_ASSOC);
$owns_request = ($row_owner['CNT'] > 0);
oci_free_statement($stmt_owner);

if (!$owns_request) {
    echo json_encode([
        'success' => false,
        'message' => '권한이 없습니다.'
    ]);
    oci_close($conn);
    exit;
}

// 트랜잭션 시작
foreach ($preferences as $preference) {
    $preference_id = $preference['preference_id'] ?? null;
    $prefer_date = $preference['prefer_date'] ?? null;

    if (!$preference_id || !$prefer_date) {
        echo json_encode([
            'success' => false,
            'message' => '선호일자 데이터가 누락되었습니다.'
        ]);
        oci_rollback($conn);
        exit;
    }

    // 선호일자 유효성 검사 (24시간 이후)
    $now = new DateTime("now", new DateTimeZone('Asia/Seoul'));
    $preferred = DateTime::createFromFormat('Y-m-d\TH:i', $prefer_date, new DateTimeZone('Asia/Seoul'));

    if (!$preferred) {
        echo json_encode([
            'success' => false,
            'message' => '유효하지 않은 날짜 형식입니다.'
        ]);
        oci_rollback($conn);
        exit;
    }

    $interval = $preferred->getTimestamp() - $now->getTimestamp();

    if ($interval < 24 * 60 * 60) {
        echo json_encode([
            'success' => false,
            'message' => '선호일자는 현재 시간으로부터 24시간 이후여야 합니다.'
        ]);
        oci_rollback($conn);
        exit;
    }

    $prefer_date_formatted = $preferred->format('Y-m-d H:i:s');


    $update_query = "
        UPDATE REQUEST_PREFERENCE_DATE
        SET PREFER_DATE = TO_DATE(:prefer_date, 'YYYY-MM-DD HH24:MI:SS')
        WHERE REQUEST_ID = :request_id AND PREFERENCE_ID = :preference_id
    ";
    $stmt_update = oci_parse($conn, $update_query);
    if (!$stmt_update) {
        $error = oci_error($conn);
        echo json_encode([
            'success' => false,
            'message' => 'REQUEST_PREFERENCE_DATE 업데이트 쿼리 준비 실패.',
            'error' => $error['message']
        ]);
        oci_rollback($conn);
        oci_close($conn);
        exit;
    }

    oci_bind_by_name($stmt_update, ':prefer_date', $prefer_date_formatted);
    oci_bind_by_name($stmt_update, ':request_id', $request_id);
    oci_bind_by_name($stmt_update, ':preference_id', $preference_id);

    if (!oci_execute($stmt_update, OCI_NO_AUTO_COMMIT)) {
        $error = oci_error($stmt_update);
        echo json_encode([
            'success' => false,
            'message' => 'REQUEST_PREFERENCE_DATE 업데이트 중 오류가 발생했습니다.',
            'error' => $error['message']
        ]);
        oci_free_statement($stmt_update);
        oci_rollback($conn);
        oci_close($conn);
        exit;
    }

    $affected_rows = oci_num_rows($stmt_update);
    oci_free_statement($stmt_update);

    if ($affected_rows === 0) {
        $insert_query = "
            INSERT INTO REQUEST_PREFERENCE_DATE (REQUEST_ID, PREFERENCE_ID, PREFER_DATE)
            VALUES (:request_id, :preference_id, TO_DATE(:prefer_date, 'YYYY-MM-DD HH24:MI:SS'))
        ";
        $stmt_insert = oci_parse($conn, $insert_query);
        if (!$stmt_insert) {
            $error = oci_error($conn);
            echo json_encode([
                'success' => false,
                'message' => 'REQUEST_PREFERENCE_DATE 삽입 쿼리 준비 실패.',
                'error' => $error['message']
            ]);
            oci_rollback($conn);
            oci_close($conn);
            exit;
        }

        oci_bind_by_name($stmt_insert, ':request_id', $request_id);
        oci_bind_by_name($stmt_insert, ':preference_id', $preference_id);
        oci_bind_by_name($stmt_insert, ':prefer_date', $prefer_date_formatted);

        if (!oci_execute($stmt_insert, OCI_NO_AUTO_COMMIT)) {
            $error = oci_error($stmt_insert);
            echo json_encode([
                'success' => false,
                'message' => 'REQUEST_PREFERENCE_DATE 삽입 중 오류가 발생했습니다.',
                'error' => $error['message']
            ]);
            oci_free_statement($stmt_insert);
            oci_rollback($conn);
            oci_close($conn);
            exit;
        }
        oci_free_statement($stmt_insert);
    }
}

// 커밋
if (!oci_commit($conn)) {
    $error = oci_error($conn);
    echo json_encode([
        'success' => false,
        'message' => '트랜잭션 커밋 중 오류가 발생했습니다.',
        'error' => $error['message']
    ]);
    oci_rollback($conn);
    oci_close($conn);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => '요청이 성공적으로 수정되었습니다.'
]);

oci_close($conn);
exit;
?>
