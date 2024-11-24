<?php
// review.php의 변경된 시작 부분
$config = require '../../../config.php';

header('Content-Type: text/html; charset=UTF-8');

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
  $e = oci_error();
  die("연결 실패: " . htmlspecialchars($e['message']));
}

$modelId = $_GET['model_id'] ?? 0; // 전달된 모델 ID 받기

if (!$modelId) {
  die("<p class='text-red-500 font-bold'>모델 ID가 없습니다.</p>");
}

// 기존 리뷰 조회 쿼리 그대로 사용
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

// 리뷰 내용 출력
while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
  $rating = htmlspecialchars($row['RATING']);
  $comment = htmlspecialchars($row['ADDITIONAL_COMMENT']);
  $dateCreated = htmlspecialchars($row['DATE_CREATED']);
  $customerName = htmlspecialchars($row['CUSTOMER_NAME']);
  echo "
    <div class='review-item'>
      <div class='review-details'>
        <span class='stars'>" . str_repeat('★', $rating) . "</span>
        <span class='review-author-date'>$customerName | $dateCreated</span>
      </div>
      <div class='review-text'>$comment</div>
    </div>
  ";
}

oci_free_statement($stmt);
oci_close($conn);
?>
