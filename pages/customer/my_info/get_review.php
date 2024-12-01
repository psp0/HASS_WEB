<?php
$config = require '../../../config.php';


$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
(HOST={$config['host']})(PORT={$config['port']}))
(CONNECT_DATA=(SID={$config['sid']})))";

$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo json_encode(['success' => false, 'message' => '연결 실패']);
    exit;
}


if (!isset($_SESSION['auth_id']) || empty($_SESSION['auth_id'])) {
    echo json_encode(['success' => false, 'message' => '로그인이 필요합니다.']);
    exit;
}

$currentUserID = $_SESSION['auth_id'];
$model_id = isset($_GET['model_id']) ? intval($_GET['model_id']) : null;

if ($model_id === null) {
    echo json_encode(['success' => false, 'message' => '모델 ID가 지정되지 않았습니다.']);
    exit;
}

$query = "SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':auth_id', $currentUserID);

if (oci_execute($stmt)) {
    $row = oci_fetch_array($stmt, OCI_ASSOC);
    if ($row) {
        $customer_id = $row['CUSTOMER_ID'];
    } else {
        echo json_encode(['success' => false, 'message' => '사용자 정보를 찾을 수 없습니다.']);
        exit;
    }
} else {
    $e = oci_error($stmt);
    echo json_encode(['success' => false, 'message' => '고객 정보 가져오기 실패']);
    exit;
}

$review_query = "
SELECT RATING, ADDITIONAL_COMMENT
FROM MODEL_RATING
WHERE CUSTOMER_ID = :customer_id AND MODEL_ID = :model_id
";
$review_stmt = oci_parse($conn, $review_query);
oci_bind_by_name($review_stmt, ':customer_id', $customer_id);
oci_bind_by_name($review_stmt, ':model_id', $model_id);

if (oci_execute($review_stmt)) {
    $row = oci_fetch_array($review_stmt, OCI_ASSOC);
    if ($row) {
        echo json_encode([
            'success' => true,
            'rating' => $row['RATING'],
            'additional_comment' => $row['ADDITIONAL_COMMENT']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => '리뷰를 찾을 수 없습니다.']);
    }
} else {
    $e = oci_error($review_stmt);
    echo json_encode(['success' => false, 'message' => '리뷰 가져오기 실패']);
}

oci_free_statement($stmt);
oci_free_statement($review_stmt);
oci_close($conn);
?>
