<?php
$config = require '../../../config.php';

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    echo "<p class='text-red-500'>연결 실패: 서버 문제로 데이터를 가져올 수 없습니다.</p>";
    exit;
}

$modelId = isset($_GET['model_id']) ? (int) $_GET['model_id'] : 0;

// 평균 별점 및 리뷰 데이터 조회
$query = "
    SELECT 
        MR.RATING, 
        MR.ADDITIONAL_COMMENT, 
        TO_CHAR(MR.DATE_CREATED, 'YYYY-MM-DD') AS DATE_CREATED, 
        C.CUSTOMER_NAME
    FROM CUSTOMER C
    JOIN SUBSCRIPTION S ON C.CUSTOMER_ID = S.CUSTOMER_ID
    JOIN MODEL_RATING MR ON S.SUBSCRIPTION_ID = MR.SUBSCRIPTION_ID
    WHERE S.MODEL_ID = :modelId
    ORDER BY MR.DATE_CREATED DESC
";
$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':modelId', $modelId);
oci_execute($stmt);

$reviews = [];
while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
    $reviews[] = $row;
}

if (empty($reviews)) {
    echo "<p class='text-center text-red-500 font-bold'>리뷰가 없습니다.</p>";
} else {
    foreach ($reviews as $review) {
        $rating = htmlspecialchars($review['RATING']);
        $comment = htmlspecialchars($review['ADDITIONAL_COMMENT']);
        $dateCreated = htmlspecialchars($review['DATE_CREATED']);
        $customerName = htmlspecialchars($review['CUSTOMER_NAME']);

        echo "<div class='review-item mb-4'>";
        echo "<div class='review-details flex justify-between'>";
        echo "<span class='stars'>" . str_repeat('★', $rating) . "</span>";
        echo "<span class='text-sm text-gray-500'>{$customerName} | {$dateCreated}</span>";
        echo "</div>";
        echo "<div class='review-text mt-2'>{$comment}</div>";
        echo "</div>";
    }
}

oci_free_statement($stmt);
oci_close($conn);
?>
