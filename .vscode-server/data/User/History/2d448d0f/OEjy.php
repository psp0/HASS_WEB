<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<script src="https://cdn.tailwindcss.com"></script>
<style>
    body {
        font-family: 'Noto Sans KR', sans-serif;
    }

    .review-summary {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
    }

    .review-summary h1 {
        color: #1D4ED8;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .reviews {
        margin-top: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .review-item {
        border-bottom: 1px solid #e5e7eb;
        padding: 10px 0;
    }

    .review-item:last-child {
        border-bottom: none;
    }

    .stars {
        color: gold;
        font-size: 1rem;
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

    $modelId = 3;

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
