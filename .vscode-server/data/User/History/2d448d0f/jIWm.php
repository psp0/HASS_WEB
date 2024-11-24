<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<style>
    body {
        font-family: 'Noto Sans KR', sans-serif;
    }

    .content-container {
        margin: 0 auto;
        padding: 20px;
        max-width: 700px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .review-summary h1 {
        color: #1D4ED8;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 1rem;
    }

    .review-item {
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .review-item .stars {
        color: #FFD700;
        font-size: 1.2rem;
    }

    .review-item .review-text {
        color: #374151;
        font-size: 1rem;
        margin-top: 0.5rem;
    }

    .review-item .review-author-date {
        text-align: right;
        color: #6b7280;
        font-size: 0.9rem;
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

    $modelId = 3;

    $query = "
        SELECT 
            MR.RATING, 
            MR.ADDITIONAL_COMMENT, 
            TO_CHAR(MR.DATE_CREATED, 'DD-MON-YY') AS DATE_CREATED,
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
            <div class="stars"><?= str_repeat('★', $rating) ?></div>
            <p class="review-text"><?= $comment ?></p>
            <div class="review-author-date"><?= $customerName ?> | <?= $dateCreated ?></div>
        </div>
    <?php } ?>

    <?php if (!$hasReviews): ?>
        <p class="text-center text-red-500 font-bold">리뷰가 없습니다.</p>
    <?php endif; ?>

    <?php
    oci_free_statement($stmt);
    oci_close($conn);
    ?>
</div>

<?php
include BASE_PATH . '/includes/footer.php';
?>
