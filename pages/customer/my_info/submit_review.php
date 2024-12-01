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

$currentUserID = $_SESSION['auth_id'];
$customer_id = null;

// CUSTOMER_ID 
$query = "SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':auth_id', $currentUserID);

if (oci_execute($stmt)) {
    $row = oci_fetch_array($stmt, OCI_ASSOC);
    if ($row) {
        $customer_id = $row['CUSTOMER_ID'];
    } else {
        echo "사용자 정보를 찾을 수 없습니다.";
        exit;
    }
} else {
    $e = oci_error($stmt);
    echo "고객 정보 가져오기 실패: " . htmlspecialchars($e['message']);
    exit;
}

$rating = isset($_POST['rating']) ? intval($_POST['rating']) : null;
$additional_comment = isset($_POST['additional_comment']) ? $_POST['additional_comment'] : '';
$model_id = isset($_POST['model_id']) ? intval($_POST['model_id']) : null;


if ($rating === null || $rating < 1 || $rating > 5) {
    echo "별점을 선택해주세요.";
    exit;
}


if ($model_id === null) {
    echo "모델 정보를 찾을 수 없습니다.";
    exit;
}


date_default_timezone_set('Asia/Seoul');
$current_date = date('Y-m-d H:i:s'); 

// 기존 리뷰 존재 하는지 
$check_query = "
SELECT COUNT(*) AS COUNT
FROM MODEL_RATING
WHERE CUSTOMER_ID = :customer_id AND MODEL_ID = :model_id
";
$check_stmt = oci_parse($conn, $check_query);
oci_bind_by_name($check_stmt, ':customer_id', $customer_id);
oci_bind_by_name($check_stmt, ':model_id', $model_id);
oci_execute($check_stmt);
$row = oci_fetch_array($check_stmt, OCI_ASSOC);
$review_exists = $row['COUNT'] > 0;

if ($review_exists) {
    // 만약 존재한다면 기존 리뷰 업데이트 한다.
    $update_query = "
    UPDATE MODEL_RATING
    SET RATING = :rating, ADDITIONAL_COMMENT = :additional_comment, DATE_EDITED = TO_TIMESTAMP(:current_date, 'YYYY-MM-DD HH24:MI:SS')
    WHERE CUSTOMER_ID = :customer_id AND MODEL_ID = :model_id
    ";
    $update_stmt = oci_parse($conn, $update_query);
    oci_bind_by_name($update_stmt, ':rating', $rating);
    oci_bind_by_name($update_stmt, ':additional_comment', $additional_comment);
    oci_bind_by_name($update_stmt, ':current_date', $current_date);
    oci_bind_by_name($update_stmt, ':customer_id', $customer_id);
    oci_bind_by_name($update_stmt, ':model_id', $model_id);

    if (oci_execute($update_stmt, OCI_COMMIT_ON_SUCCESS)) {
        echo "success";
    } else {
        $e = oci_error($update_stmt);
        echo "리뷰 수정 실패: " . htmlspecialchars($e['message']);
    }

    oci_free_statement($update_stmt);
} else {
    // 존재하지 않으면 새로운 리뷰 삽입
    $insert_query = "
        INSERT INTO MODEL_RATING (
            RATING_ID, RATING, ADDITIONAL_COMMENT, DATE_CREATED, CUSTOMER_ID, MODEL_ID
        ) VALUES (
            MR_SEQ.NEXTVAL, :rating, :additional_comment, TO_TIMESTAMP(:current_date, 'YYYY-MM-DD HH24:MI:SS'), :customer_id, :model_id
        )
    ";

    $insert_stmt = oci_parse($conn, $insert_query);
    oci_bind_by_name($insert_stmt, ':rating', $rating);
    oci_bind_by_name($insert_stmt, ':additional_comment', $additional_comment);
    oci_bind_by_name($insert_stmt, ':current_date', $current_date);
    oci_bind_by_name($insert_stmt, ':customer_id', $customer_id);
    oci_bind_by_name($insert_stmt, ':model_id', $model_id);

    if (oci_execute($insert_stmt, OCI_COMMIT_ON_SUCCESS)) {
        echo "success";
    } else {
        $e = oci_error($insert_stmt);
        echo "리뷰 등록 실패: " . htmlspecialchars($e['message']);
    }

    oci_free_statement($insert_stmt);
}

oci_free_statement($stmt);
oci_free_statement($check_stmt);
oci_close($conn);
?>
