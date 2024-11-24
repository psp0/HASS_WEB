<?php
require '../../../config.php';

// 모델 ID 가져오기
$model_id = isset($_GET['model_id']) ? (int)$_GET['model_id'] : 0;

// DB 연결 설정
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

// 리뷰 데이터 가져오기
$query = "SELECT MR.RATING, MR.ADDITIONAL_COMMENT, MR.DATE_CREATED, MR.DATE_EDITED, C.CUSTOMER_NAME
          FROM CUSTOMER C
          JOIN SUBSCRIPTION S ON C.CUSTOMER_ID = S.CUSTOMER_ID
          JOIN MODEL_RATING MR ON S.SUBSCRIPTION_ID = MR.SUBSCRIPTION_ID
          WHERE S.MODEL_ID = :model_id";
$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ":model_id", $model_id);
oci_execute($stmt);

$reviews = [];
while ($row = oci_fetch_assoc($stmt)) {
    $reviews[] = $row;
}

oci_free_statement($stmt);
oci_close($conn);

// 리뷰 데이터 출력
if (count($reviews) > 0) {
    foreach ($reviews as $review) {
        echo "<div class='review-item'>";
        echo "<div class='review-details'>";
        echo "<div class='stars'>" . str_repeat("★", $review['RATING']) . "</div>";
        echo "<div class='review-author-date'>" . htmlspecialchars($review['CUSTOMER_NAME']) . " | " . $review['DATE_CREATED'] . "</div>";
        echo "</div>";
        echo "<div class='review-text'>" . htmlspecialchars($review['ADDITIONAL_COMMENT']) . "</div>";
        echo "</div>";
    }
} else {
    echo "<p>리뷰가 없습니다.</p>";
}
?>
