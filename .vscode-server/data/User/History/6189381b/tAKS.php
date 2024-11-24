<?php
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';

// DB 연결 설정
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

// 모델 ID 예시 (필요에 따라 동적으로 설정 가능)
$model_id = 3;

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
$star_counts = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
$total_reviews = 0;

while ($row = oci_fetch_assoc($stmt)) {
    $reviews[] = $row;
    $star_counts[$row['RATING']]++;
    $total_reviews++;
}

// 별점 비율 계산
$star_percentages = [];
foreach ($star_counts as $star => $count) {
    $star_percentages[$star] = $total_reviews > 0 ? ($count / $total_reviews) * 100 : 0;
}

oci_free_statement($stmt);
oci_close($conn);
?>

<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>리뷰 페이지</title>
<style>
  /* 기본 스타일 설정 */
  body, html {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  /* 모달 스타일 */
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background: #ffffff;
    padding: 20px;
    width: 95%;
    max-width: 700px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
    color: #999;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
  }

  /* 리뷰 요약 스타일 */
  .review-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .rating-score-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50%;
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
    width: 50%;
  }

  .rating-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    width: 100%;
  }

  .rating-bar span {
    width: 40px;
    font-size: 14px;
    color: #666;
  }

  .bar {
    background-color: #ddd;
    width: 80%;
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

  /* 리뷰 상세 스타일 */
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .reviews {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .review-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }

  .review-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .review-text {
    color: #666;
    font-size: 14px;
    margin-top: 5px;
  }
</style>
</head>
<body>

<!-- 모달 창 HTML -->
<div id="reviewModal" class="modal">
  <div class="modal-content">
    <span class="close" onclick="closeModal()">&times;</span>

    <!-- 리뷰 요약 -->
    <div class="review-summary">
      <div class="rating-score-container">
        <div class="rating-score">5.0</div>
        <div class="stars">★★★★★</div>
      </div>
      <div class="rating-distribution">
        <h4>별점 비율</h4>
        <?php foreach ($star_counts as $star => $count): ?>
            <div class="rating-bar">
                <span><?php echo $star; ?>점</span>
                <div class="bar">
                    <div class="bar-fill" style="width: <?php echo $star_percentages[$star]; ?>%;"></div>
                </div>
                <span>(<?php echo $count; ?>)</span>
            </div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- 전체 리뷰 -->
    <div class="review-header">
      <h3>전체 리뷰</h3>
    </div>

    <div class="reviews">
      <?php foreach ($reviews as $review): ?>
        <div class="review-item">
          <div class="review-details">
            <div class="stars"><?php echo str_repeat("★", $review['RATING']); ?></div>
            <div class="review-author-date"><?php echo htmlspecialchars($review['CUSTOMER_NAME']); ?> | <?php echo $review['DATE_CREATED']; ?></div>
          </div>
          <div class="review-text">
            <?php echo htmlspecialchars($review['ADDITIONAL_COMMENT']); ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<script>
// 모달 열기/닫기 기능
function openModal() {
  document.getElementById("reviewModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("reviewModal").style.display = "none";
}

// 페이지 로드 시 모달 자동 표시 방지
window.onload = function () {
  document.getElementById("reviewModal").style.display = "none";
};
</script>

</body>
</html>
