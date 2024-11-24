<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

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
  <?php
  $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
  $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

  if (!$conn) {
    $e = oci_error();
    echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
  }

  $modelId = 1;

  // 정렬 옵션 처리
  $sort = $_GET['sort'] ?? 'latest';
  $orderBy = 'MR.DATE_CREATED DESC'; // 기본: 최신순

  if ($sort === 'highest') {
    $orderBy = 'MR.RATING DESC, MR.DATE_CREATED DESC'; // 별점 높은 순
  } elseif ($sort === 'lowest') {
    $orderBy = 'MR.RATING ASC, MR.DATE_CREATED DESC'; // 별점 낮은 순
  }
  
  // 평균 별점 계산
  $ratingQuery = "
    SELECT 
      ROUND(AVG(MR.RATING), 1) AS AVG_RATING,
      COUNT(CASE WHEN MR.RATING = 5 THEN 1 END) AS FIVE_STARS,
      COUNT(CASE WHEN MR.RATING = 4 THEN 1 END) AS FOUR_STARS,
      COUNT(CASE WHEN MR.RATING = 3 THEN 1 END) AS THREE_STARS,
      COUNT(CASE WHEN MR.RATING = 2 THEN 1 END) AS TWO_STARS,
      COUNT(CASE WHEN MR.RATING = 1 THEN 1 END) AS ONE_STAR
    FROM MODEL_RATING MR
    JOIN SUBSCRIPTION S ON MR.SUBSCRIPTION_ID = S.SUBSCRIPTION_ID
    WHERE S.MODEL_ID = :modelId
  ";
  $ratingStmt = oci_parse($conn, $ratingQuery);
  oci_bind_by_name($ratingStmt, ':modelId', $modelId);
  oci_execute($ratingStmt);
  $ratingData = oci_fetch_assoc($ratingStmt);

  $avgRating = $ratingData['AVG_RATING'] ?? 0;
  ?>

  <div class="rating-score-container">
    <div class="rating-score"><?= htmlspecialchars($avgRating) ?></div>
    <div class="stars"><?= str_repeat('★', round($avgRating)) ?></div>
  </div>

  <div class="rating-distribution">
    <h4>별점 비율</h4>
    <?php
    $stars = [
      5 => $ratingData['FIVE_STARS'] ?? 0,
      4 => $ratingData['FOUR_STARS'] ?? 0,
      3 => $ratingData['THREE_STARS'] ?? 0,
      2 => $ratingData['TWO_STARS'] ?? 0,
      1 => $ratingData['ONE_STAR'] ?? 0,
    ];
    $totalReviews = array_sum($stars);

    foreach ($stars as $star => $count) {
      $percentage = ($totalReviews > 0) ? round(($count / $totalReviews) * 100, 1) : 0;
      ?>
      <div class="rating-bar">
        <span><?= $star ?>점</span>
        <div class="bar">
          <div class="bar-fill" style="width: <?= $percentage ?>%;"></div>
        </div>
        <span>(<?= htmlspecialchars($count) ?>)</span>
      </div>
    <?php } ?>
  </div>

  <div class="review-header">
    <h3>전체 리뷰</h3>
    <div class="sort-options">
      <form method="GET" class="flex items-center gap-2">
        <label for="sort">정렬:</label>
        <select id="sort" name="sort" onchange="this.form.submit()" class="border border-gray-300 rounded-md">
          <option value="latest" <?= $sort === 'latest' ? 'selected' : '' ?>>최신순</option>
          <option value="highest" <?= $sort === 'highest' ? 'selected' : '' ?>>별점 높은 순</option>
          <option value="lowest" <?= $sort === 'lowest' ? 'selected' : '' ?>>별점 낮은 순</option>
        </select>
      </form>
    </div>
  </div>

  <div class="reviews">
    <?php
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
      ORDER BY $orderBy
    ";
    $stmt = oci_parse($conn, $query);
    oci_bind_by_name($stmt, ':modelId', $modelId);
    oci_execute($stmt);

    $hasReviews = false;
    while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
      $hasReviews = true;
      $rating = htmlspecialchars($row['RATING']);
      $comment = htmlspecialchars($row['ADDITIONAL_COMMENT']);
      $dateCreated = htmlspecialchars($row['DATE_CREATED']);
      $customerName = htmlspecialchars($row['CUSTOMER_NAME']);
      ?>
      <div class="review-item">
        <div class="review-details">
          <span class="stars"><?= str_repeat('★', $rating) ?></span>
          <span class="review-author-date"><?= $customerName ?> | <?= $dateCreated ?></span>
        </div>
        <div class="review-text"><?= $comment ?></div>
      </div>
    <?php } ?>

    <?php if (!$hasReviews): ?>
      <p class="text-center text-red-500 font-bold">리뷰가 없습니다.</p>
    <?php endif; ?>
  </div>

  <?php
  oci_free_statement($ratingStmt);
  oci_free_statement($stmt);
  oci_close($conn);
  ?>
</div>

<?php
include BASE_PATH . '/includes/footer.php';
?>
