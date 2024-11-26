<?php
$config = require '../../../config.php';

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    echo "<p class='text-red-500'>연결 실패: 서버 문제로 데이터를 가져올 수 없습니다.</p>";
    exit;
}

$modelId = isset($_GET['model_id']) ? (int) $_GET['model_id'] : 1;
$sort = $_GET['sort'] ?? 'latest';



$orderBy = 'MR.DATE_CREATED DESC';
if ($sort === 'highest') {
    $orderBy = 'MR.RATING DESC, MR.DATE_CREATED DESC';
} elseif ($sort === 'lowest') {
    $orderBy = 'MR.RATING ASC, MR.DATE_CREATED DESC';
}


$ratingQuery = "
   SELECT 
    ROUND(AVG(MR.RATING), 1) AS AVG_RATING,
    COUNT(CASE WHEN MR.RATING = 5 THEN 1 END) AS FIVE_STARS,
    COUNT(CASE WHEN MR.RATING = 4 THEN 1 END) AS FOUR_STARS,
    COUNT(CASE WHEN MR.RATING = 3 THEN 1 END) AS THREE_STARS,
    COUNT(CASE WHEN MR.RATING = 2 THEN 1 END) AS TWO_STARS,
    COUNT(CASE WHEN MR.RATING = 1 THEN 1 END) AS ONE_STAR
FROM MODEL_RATING MR
WHERE MR.MODEL_ID = :modelId

";

$ratingStmt = oci_parse($conn, $ratingQuery);
oci_bind_by_name($ratingStmt, ':modelId', $modelId);
oci_execute($ratingStmt);
$ratingData = oci_fetch_assoc($ratingStmt);

$avgRating = $ratingData['AVG_RATING'] ?? 0;


$reviewQuery = "SELECT 
    MR.RATING, 
    MR.ADDITIONAL_COMMENT, 
    TO_CHAR(MR.DATE_CREATED, 'YYYY-MM-DD HH24:MI:SS') AS DATE_CREATED, 
    C.CUSTOMER_NAME
FROM CUSTOMER C
JOIN MODEL_RATING MR ON C.CUSTOMER_ID = MR.CUSTOMER_ID
WHERE MR.MODEL_ID = :modelId
ORDER BY $orderBy
";



$reviewStmt = oci_parse($conn, $reviewQuery);
oci_bind_by_name($reviewStmt, ':modelId', $modelId);
oci_execute($reviewStmt);
?>


<div class="rating-score-container">
    <div class="rating-score"><?= htmlspecialchars($avgRating) ?></div>
    <div class="stars"><?= str_repeat('★', round($avgRating)) ?></div>
</div>


<div class="rating-distribution">
    <h4 class="font-bold">별점 비율</h4>
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
            <span class="rating-label"><?= $star ?>점</span>
            <div class="bar">
                <div class="bar-fill" style="width: <?= $percentage ?>%;"></div>
            </div>
            <span class="rating-count">(<?= htmlspecialchars($count) ?>)</span>
        </div>
    <?php } ?>
</div>


<div class="review-header flex justify-between items-center">
    <h3 class="font-bold text-lg">전체 리뷰</h3>
    <form class="flex items-center gap-2">
        <label for="sort" class="text-gray-600">정렬 :</label>
        <select id="sort" name="sort" class="border border-gray-300 rounded-md px-2 py-1">
            <option value="latest" <?= $sort === 'latest' ? 'selected' : '' ?>>최신순</option>
            <option value="highest" <?= $sort === 'highest' ? 'selected' : '' ?>>별점 높은 순</option>
            <option value="lowest" <?= $sort === 'lowest' ? 'selected' : '' ?>>별점 낮은 순</option>
        </select>
    </form>
</div>


<div class="reviews">
    <?php
    $hasReviews = false;
    function maskName($name)
    {
        if (mb_strlen($name) <= 1) {
            return $name;
        }
        $firstChar = mb_substr($name, 0, 1); 
        $lastChar = mb_substr($name, -1);   
        return $firstChar . 'x' . $lastChar; 
    }
    while ($row = oci_fetch_array($reviewStmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
        $hasReviews = true;
        $maskedName = maskName($row['CUSTOMER_NAME']);
        ?>
        <div class="review-item">
            <div class="review-details">
                <span class="stars"><?= str_repeat('★', htmlspecialchars($row['RATING'])) ?></span>
                <span class="review-author-date"><?= htmlspecialchars($maskedName) ?> |
                    <?= htmlspecialchars($row['DATE_CREATED']) ?></span>
            </div>
            <div class="review-text"><?= htmlspecialchars($row['ADDITIONAL_COMMENT']) ?></div>
        </div>
    <?php }

    if (!$hasReviews): ?>
        <p class="text-center text-red-500 font-bold">리뷰가 없습니다.</p>
    <?php endif; ?>
</div>

<?php
oci_free_statement($ratingStmt);
oci_free_statement($reviewStmt);
oci_close($conn);
?>