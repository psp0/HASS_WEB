<?php
require '../../../config.php'; // 설정 파일 포함
include BASE_PATH . '/includes/customer_header.php'; // 헤더 포함

// 데이터베이스 연결 설정
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

// 모델 ID 설정
$model_id = 5;

// 리뷰 데이터를 가져오는 SQL 쿼리
$query = "
    SELECT 
        MR.RATING, 
        MR.ADDITIONAL_COMMENT, 
        MR.DATE_CREATED, 
        MR.DATE_EDITED, 
        C.CUSTOMER_NAME
    FROM CUSTOMER C
    JOIN SUBSCRIPTION S ON C.CUSTOMER_ID = S.CUSTOMER_ID
    JOIN MODEL_RATING MR ON S.SUBSCRIPTION_ID = MR.SUBSCRIPTION_ID
    WHERE S.MODEL_ID = :model_id
";

$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':model_id', $model_id);
oci_execute($stmt);
?>

<style>
  /* 페이지 스타일 */
  .content-container {
    margin: 0 auto;
    padding: 20px;
    max-width: 700px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .rating-score-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50%;
    margin: 0 auto 20px;
  }

  .rating-score {
    font-size: 48px;
    font-weight: bold;
    color: #333;
    text-align: center;
  }

  .stars {
    color: gold;
    font-size: 24px;
    text-align: center;
  }

  .rating-distribution {
    margin-top: 20px;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .review-header h3 {
    font-size: 18px;
    color: #333;
  }

  .reviews {
    margin-top: 20px;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .review-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }

  .review-item:last-child {
    border-bottom: none;
  }

  .review-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .review-details .stars {
    font-size: 16px;
    color: gold;
  }

  .review-author-date {
    color: #999;
    font-size: 14px;
  }

  .review-text {
    color: #666;
    font-size: 14px;
    margin-top: 5px;
  }
</style>

<div class="content-container">
  <h1 class="text-2xl font-bold mb-4">모델 리뷰</h1>

  <div class="reviews">
    <?php 
    while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)): ?>
      <div class="review-item">
        <div class="review-details">
          <div class="stars"><?php echo str_repeat('★', $row['RATING']); ?></div>
          <div class="review-author-date"><?php echo htmlspecialchars($row['CUSTOMER_NAME']); ?> | <?php echo htmlspecialchars($row['DATE_CREATED']); ?></div>
        </div>
        <div class="review-text">
          <?php echo htmlspecialchars($row['ADDITIONAL_COMMENT']); ?>
        </div>
      </div>
    <?php endwhile; ?>
  </div>
</div>

<?php
// 리소스 해제
oci_free_statement($stmt);
oci_close($conn);

// Footer 포함
include BASE_PATH . '/includes/footer.php';
?>
