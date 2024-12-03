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


if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => '잘못된 요청 방법입니다.'
    ]);
    exit;
}


$request_id = $_GET['request_id'] ?? null;

if (!$request_id) {
    echo json_encode([
        'success' => false,
        'message' => '요청 ID가 누락되었습니다.'
    ]);
    oci_close($conn);
    exit;
}


$request_query = "
    SELECT r.REQUEST_ID, r.REQUEST_TYPE, r.REQUEST_STATUS, r.ADDITIONAL_COMMENT,
           r.DATE_CREATED, r.DATE_EDITED, s.SUBSCRIPTION_ID, p.MODEL_ID
    FROM REQUEST r
    JOIN SUBSCRIPTION s ON r.SUBSCRIPTION_ID = s.SUBSCRIPTION_ID
    JOIN PRODUCT p ON s.SERIAL_NUMBER = p.SERIAL_NUMBER
    WHERE r.REQUEST_ID = :request_id
";
$stmt_request = oci_parse($conn, $request_query);
if (!$stmt_request) {
    $error = oci_error($conn);
    echo json_encode([
        'success' => false,
        'message' => '요청 쿼리 준비 실패.',
        'error' => $error['message']
    ]);
    oci_close($conn);
    exit;
}
oci_bind_by_name($stmt_request, ':request_id', $request_id);

if (!oci_execute($stmt_request)) {
    $error = oci_error($stmt_request);
    echo json_encode([
        'success' => false,
        'message' => '요청 조회에 실패했습니다.',
        'error' => $error['message']
    ]);
    oci_free_statement($stmt_request);
    oci_close($conn);
    exit;
}

$request = oci_fetch_array($stmt_request, OCI_ASSOC);
oci_free_statement($stmt_request);

if (!$request) {
    echo json_encode([
        'success' => false,
        'message' => '해당 요청을 찾을 수 없습니다.'
    ]);
    oci_close($conn);
    exit;
}


if ($request['REQUEST_STATUS'] === '방문예정') {
    // 방문예정일 조회
    $visit_query = "
        SELECT v.VISIT_DATE, w.WORKER_NAME
        FROM VISIT v
        JOIN WORKER w ON v.WORKER_ID = w.WORKER_ID
        WHERE v.REQUEST_ID = :request_id
    ";
    $stmt_visit = oci_parse($conn, $visit_query);
    if (!$stmt_visit) {
        $error = oci_error($conn);
        echo json_encode([
            'success' => false,
            'message' => '방문예정일 쿼리 준비 실패.',
            'error' => $error['message']
        ]);
        oci_close($conn);
        exit;
    }
    oci_bind_by_name($stmt_visit, ':request_id', $request_id);
    
    if (!oci_execute($stmt_visit)) {
        $error = oci_error($stmt_visit);
        echo json_encode([
            'success' => false,
            'message' => '방문예정일 조회에 실패했습니다.',
            'error' => $error['message']
        ]);
        oci_free_statement($stmt_visit);
        oci_close($conn);
        exit;
    }
    
    $visit = oci_fetch_array($stmt_visit, OCI_ASSOC);
    oci_free_statement($stmt_visit);
    
    if ($visit) {
        $response = [
            'success' => true,
            'request' => $request,
            'visit_date' => $visit['VISIT_DATE'],
            'worker_name' => $visit['WORKER_NAME']
        ];
    } else {
        $response = [
            'success' => false,
            'message' => '방문예정일 정보가 없습니다.'
        ];
    }
} else {
    // 선호일자 조회
    $pref_query = "
        SELECT PREFERENCE_ID, PREFER_DATE
        FROM REQUEST_PREFERENCE_DATE
        WHERE REQUEST_ID = :request_id
    ";
    $stmt_pref = oci_parse($conn, $pref_query);
    if (!$stmt_pref) {
        $error = oci_error($conn);
        echo json_encode([
            'success' => false,
            'message' => '선호일자 쿼리 준비 실패.',
            'error' => $error['message']
        ]);
        oci_close($conn);
        exit;
    }
    oci_bind_by_name($stmt_pref, ':request_id', $request_id);
    
    if (!oci_execute($stmt_pref)) {
        $error = oci_error($stmt_pref);
        echo json_encode([
            'success' => false,
            'message' => '선호일자 조회에 실패했습니다.',
            'error' => $error['message']
        ]);
        oci_free_statement($stmt_pref);
        oci_close($conn);
        exit;
    }
    
    $preferences = [];
    while ($pref = oci_fetch_array($stmt_pref, OCI_ASSOC)) {
        $preferences[] = [
            'preference_id' => $pref['PREFERENCE_ID'],
            'prefer_date' => $pref['PREFER_DATE']
        ];
    }
    oci_free_statement($stmt_pref);
    
    $response = [
        'success' => true,
        'request' => $request,
        'preferences' => $preferences
    ];
}

oci_close($conn);

echo json_encode($response);
exit;
?>
