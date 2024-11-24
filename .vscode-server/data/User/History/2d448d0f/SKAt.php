<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<script src="https://cdn.tailwindcss.com"></script>
<style>
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

  .rating-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .rating-bar span {
    width: 40px;
    font-size: 14px;
    color: #666;
  }

  .bar {
    background-color: #ddd;
    width: 100%;
    height: 8px;
    border-radius: 5px;
    margin-right: 10px;
    position: relative;
  }

  .bar-fill {
    background-color: #ffcc00;
    height: 100%;
    border-radius: 5px;
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

  .sort-options {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    color: #999;
  }

  .sort-options select {
    border: none;
    background-color: #f5f5f5;
    font-size: 14px;
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

  .review-title {
    font-weight: bold;
    color: #333;
    font-size: 16px;
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

<div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
  <?php
  $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
  $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

  if (!$conn) {
    $e = oci_error();
    echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
  }

  $modelId = 1;

  $query = "
        SELECT 
            MR.RATING, 
            MR.ADDITIONAL_COMMENT, 
            MR.DATE_CREATED, 
            C.CUSTOMER_NAME
        FROM CUSTOMER C
        JOIN SUBSCRIPTION S ON C.CUSTOMER_ID = S.CUSTOMER_ID
        JOIN MODEL_RATING MR ON S.SUBSCRIPTION_ID = MR.SUBSCRIPTION_ID
        WHERE S.MODEL_ID = :modelId
    ";

  $stmt = oci_parse($conn, $query);
  oci_bind_by_name($stmt, ':modelId', $modelId);
  oci_execute($stmt);
  ?>

  <div class="review-summary">
    <h1>모델 리뷰</h1>
  </div>

  <div class="reviews">
    <?php
    $hasReviews = false;
    while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
      $hasReviews = true;
      $rating = htmlspecialchars($row['RATING']);
      $comment = htmlspecialchars($row['ADDITIONAL_COMMENT']);
      $dateCreated = htmlspecialchars($row['DATE_CREATED']);
      $customerName = htmlspecialchars($row['CUSTOMER_NAME']);
      ?>
      <div class="review-item">
        <div class="flex justify-between">
          <span class="stars"><?= str_repeat('★', $rating) ?></span>
          <span class="text-sm text-gray-500"><?= $customerName ?> | <?= $dateCreated ?></span>
        </div>
        <p class="text-gray-700 mt-2"><?= $comment ?></p>
      </div>
    <?php } ?>

    <?php if (!$hasReviews): ?>
      <p class="text-center text-red-500 font-bold">리뷰가 없습니다.</p>
    <?php endif; ?>
  </div>

  <?php
  oci_free_statement($stmt);
  oci_close($conn);
  ?>
</div>

<script>
  // 추가적인 스크립트 필요 시 여기에 작성
</script>

<?php
include BASE_PATH . '/includes/footer.php';
?>