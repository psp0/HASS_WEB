<?php
require '../../../config.php'; // 설정 파일 포함
var_dump($config);
include BASE_PATH . '/includes/customer_header.php';

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
  $e = oci_error();
  echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
  exit;
}


// 모델 ID 설정
$model_id = 3;

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

<div class="content-container">
  <div class="review-summary">
    <div class="rating-score-container">
      <div class="rating-score">5.0</div>
      <div class="stars">★★★★★</div>
    </div>
    <div class="rating-distribution">
      <h4>별점 비율</h4>
      <div class="rating-bar">
        <span>5점</span>
        <div class="bar">
          <div class="bar-fill" style="width: 95%;"></div>
        </div>
        <span>(1,327)</span>
      </div>
      <div class="rating-bar">
        <span>4점</span>
        <div class="bar">
          <div class="bar-fill" style="width: 2%; background-color: #ccc;"></div>
        </div>
        <span>(24)</span>
      </div>
      <div class="rating-bar">
        <span>3점</span>
        <div class="bar">
          <div class="bar-fill" style="width: 1%; background-color: #ccc;"></div>
        </div>
        <span>(7)</span>
      </div>
      <div class="rating-bar">
        <span>2점</span>
        <div class="bar">
          <div class="bar-fill" style="width: 0.5%; background-color: #ccc;"></div>
        </div>
        <span>(2)</span>
      </div>
      <div class="rating-bar">
        <span>1점</span>
        <div class="bar">
          <div class="bar-fill" style="width: 0.2%; background-color: #ccc;"></div>
        </div>
        <span>(3)</span>
      </div>
    </div>
  </div>

  <div class="review-header">
    <h3>전체 리뷰</h3>
    <div class="sort-options">
      <label for="sort">정렬:</label>
      <select id="sort">
        <option value="latest">최신순</option>
        <option value="highest">별점 높은 순</option>
        <option value="lowest">별점 낮은 순</option>
      </select>
    </div>
  </div>

  <div class="reviews">
    <?php
    while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)): ?>
      <div class="review-item">
        <div class="review-details">
          <div class="stars"><?php echo str_repeat('★', $row['RATING']); ?></div>
          <div class="review-author-date"><?php echo htmlspecialchars($row['CUSTOMER_NAME']); ?> |
            <?php echo htmlspecialchars($row['DATE_CREATED']); ?></div>
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
?>