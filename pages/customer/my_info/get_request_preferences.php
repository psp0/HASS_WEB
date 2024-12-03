<?php
session_start();
$config = require '../../../config.php';

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))";

$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

header('Content-Type: application/json');

if (!$conn) {
    error_log('데이터베이스 연결에 실패했습니다: ' . print_r(oci_error(), true));
    echo json_encode(['success' => false, 'message' => '데이터베이스 연결에 실패했습니다.']);
    exit;
}

$request_id = $_GET['request_id'] ?? null;

if (!$request_id) {
    echo json_encode(['success' => false, 'message' => '요청 ID가 누락되었습니다.']);
    oci_close($conn);
    exit;
}

$query = "
    SELECT PREFERENCE_ID, TO_CHAR(PREFER_DATE, 'YYYY-MM-DD HH24:MI:SS') AS PREFER_DATE
    FROM REQUEST_PREFERENCE_DATE
    WHERE REQUEST_ID = :request_id
    ORDER BY PREFERENCE_ID ASC
";

$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':request_id', $request_id);

if (!oci_execute($stmt)) {
    error_log('REQUEST_PREFERENCE_DATE 조회 실패: ' . print_r(oci_error($stmt), true));
    echo json_encode(['success' => false, 'message' => '선호일자 정보를 조회하는 데 실패했습니다.']);
    oci_free_statement($stmt);
    oci_close($conn);
    exit;
}

$preferences = [];

while ($row = oci_fetch_assoc($stmt)) {
    $preferences[] = [
        'preference_id' => $row['PREFERENCE_ID'],
        'prefer_date' => $row['PREFER_DATE'],
    ];
}

oci_free_statement($stmt);
oci_close($conn);

echo json_encode(['success' => true, 'preferences' => $preferences]);
?>
