<?php
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';

// 데이터베이스 연결
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

// 모델 ID가 3인 리뷰를 조회하는 쿼리
$reviewQuery = "
    SELECT MR.RATING, MR.ADDITIONAL_COMMENT, MR.DATE_CREATED, MR.DATE_EDITED, C.CUSTOMER_NAME
    FROM CUSTOMER C
    JOIN SUBSCRIPTION S ON C.CUSTOMER_ID = S.CUSTOMER_ID
    JOIN MODEL_RATING MR ON S.SUBSCRIPTION_ID = MR.SUBSCRIPTION_ID
    WHERE S.MODEL_ID = 3
";
$reviewStmt = oci_parse($conn, $reviewQuery);
oci_execute($reviewStmt);
$reviews = [];

while ($row = oci_fetch_assoc($reviewStmt)) {
    $reviews[] = $row; // 결과를 배열로 저장
}

oci_free_statement($reviewStmt);
oci_close($conn);
?>

<!-- 모달 창 HTML -->
<div id="reviewModal" class="modal" style="display: none;">
  <div class="modal-content">
    <span class="close" onclick="closeModal()">&times;</span>
    
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
        <!-- 추가적인 별점 비율 표시 예제 -->
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
      <?php if (empty($reviews)): ?>
        <p>리뷰가 없습니다.</p>
      <?php else: ?>
        <?php foreach ($reviews as $review): ?>
          <div class="review-item">
            <div class="review-details">
              <div class="stars"><?php echo str_repeat("★", $review['RATING']); ?></div>
              <div class="review-author-date"><?php echo htmlspecialchars($review['CUSTOMER_NAME']); ?> | <?php echo htmlspecialchars($review['DATE_CREATED']); ?></div>
            </div>
            <div class="review-text">
              <?php echo htmlspecialchars($review['ADDITIONAL_COMMENT']); ?>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>
</div>

<script>
  function openModal() {
    document.getElementById("reviewModal").style.display = "flex";
  }

  function closeModal() {
    document.getElementById("reviewModal").style.display = "none";
  }
</script>

<?php
include BASE_PATH . '/includes/customer_footer.php';
