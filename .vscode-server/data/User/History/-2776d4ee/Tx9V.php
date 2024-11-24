<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>

<script src="https://cdn.tailwindcss.com"></script>
<style>
    /* 사용자 정의 클래스 */
    body {
        font-family: 'Noto Sans KR', sans-serif;
    }

    .container {
        max-width: 1024px; /* max-w-4xl */
        margin: 0 auto; /* mx-auto */
        background-color: #ffffff; /* bg-white */
        padding: 1.5rem; /* p-6 */
        border-radius: 0.5rem; /* rounded-lg */
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* shadow-md */
    }

    .title {
        font-size: 1.875rem; /* text-2xl */
        font-weight: bold; /* font-bold */
        margin-bottom: 1rem; /* mb-4 */
    }

    .form {
        display: flex;
        align-items: center;
        gap: 1rem; /* space-x-4 */
        margin-bottom: 1.5rem; /* mb-6 */
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .label {
        font-size: 0.875rem; /* text-sm */
        font-weight: 500; /* font-medium */
        color: #4B5563; /* text-gray-700 */
    }

    .input, .select, .button, .reset-button {
        width: 100%;
        border: 1px solid #D1D5DB; /* border-gray-300 */
        border-radius: 0.375rem; /* rounded-md */
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* shadow-sm */
        padding: 0.75rem; /* p-3 */
    }

    .button {
        background-color: #3B82F6; /* bg-blue-500 */
        color: #FFFFFF; /* text-white */
        cursor: pointer;
    }

    .reset-button {
        padding: 0.25rem 0.5rem; /* px-2 py-1 */
        background-color: #3B82F6; /* bg-blue-500 */
        color: #FFFFFF; /* text-white */
        cursor: pointer;
    }

    .product-card {
        display: flex;
        align-items: center;
        gap: 1.25rem; /* gap-20px */
        background-color: #F9FAFB; /* bg-gray-50 */
        padding: 1rem; /* p-4 */
        border-radius: 0.5rem; /* rounded-lg */
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* shadow-sm */
        margin-bottom: 1.5rem; /* mb-6 */
    }

    .product-image {
        width: 120px;
        height: 120px;
    }

    .product-details {
        display: flex;
        flex-direction: column;
        gap: 0.625rem; /* gap-10px */
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem; /* gap-8px */
        position: relative;
        top: 0.625rem; /* top-10px */
        left: 0.625rem; /* left-10px */
    }

    .section-title {
        color: #1D4ED8; /* text-blue-500 */
        font-weight: bold;
        font-size: 1.25rem; /* text-xl */
        margin-bottom: 0.5rem; /* mb-2 */
    }

    .no-product-message {
        font-size: 1.5rem; /* text-2xl */
        font-weight: bold;
        color: red;
        text-align: center;
        margin-top: 1.25rem; /* mt-5 */
    }
</style>

<div class="container">
    <h1 class="title">제품 관리</h1>
    <form method="GET" action="" class="form">
        <div class="form-group">
            <label for="modelType" class="label">모델 타입:</label>
            <select name="modelType" id="modelType" class="select">
                <option value="" <?= $modelType == '' ? 'selected' : '' ?>>전체</option>
                <option value="공기청정기" <?= $modelType == '공기청정기' ? 'selected' : '' ?>>공기청정기</option>
                <option value="건조기" <?= $modelType == '건조기' ? 'selected' : '' ?>>건조기</option>
                <option value="TV" <?= $modelType == 'TV' ? 'selected' : '' ?>>TV</option>
                <option value="세탁기" <?= $modelType == '세탁기' ? 'selected' : '' ?>>세탁기</option>
            </select>
        </div>
        <div class="form-group">
            <label for="productStatus" class="label">제품 상태:</label>
            <select name="productStatus" id="productStatus" class="select">
                <option value="" <?= $productStatus == '' ? 'selected' : '' ?>>전체</option>
                <option value="재고" <?= $productStatus == '재고' ? 'selected' : '' ?>>재고</option>
                <option value="구독대기" <?= $productStatus == '구독대기' ? 'selected' : '' ?>>구독대기</option>
                <option value="구독중" <?= $productStatus == '구독중' ? 'selected' : '' ?>>구독중</option>
            </select>
        </div>
        <div class="form-group flex-1">
            <label for="serialNumber" class="label">시리얼번호:</label>
            <input type="text" name="serialNumber" id="serialNumber" placeholder="시리얼번호 검색" value="<?= htmlspecialchars($serialNumber) ?>" class="input">
        </div>
        <button type="submit" class="button">검색</button>
        <button type="reset" class="reset-button" onclick="location.href='product.php'">초기화</button>
    </form>

    <?php
    $query = "SELECT P.SERIAL_NUMBER, P.PRODUCT_STATUS, M.MODEL_ID, M.MODEL_NAME, M.MODEL_TYPE
              FROM PRODUCT P
              JOIN MODEL M ON P.MODEL_ID = M.MODEL_ID";
    $conditions = [];

    if ($modelType) {
        $conditions[] = "M.MODEL_TYPE = :modelType";
    }
    if ($productStatus) {
        $conditions[] = "P.PRODUCT_STATUS = :productStatus";
    }
    if ($serialNumber) {
        $conditions[] = "P.SERIAL_NUMBER = :serialNumber";
    }

    if (count($conditions) > 0) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $stmt = oci_parse($conn, $query);

    if ($modelType) {
        oci_bind_by_name($stmt, ':modelType', $modelType);
    }
    if ($productStatus) {
        oci_bind_by_name($stmt, ':productStatus', $productStatus);
    }
    if ($serialNumber) {
        oci_bind_by_name($stmt, ':serialNumber', $serialNumber);
    }

    oci_execute($stmt);
    $hasProducts = false;

    while ($product = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
        $hasProducts = true;
        $serial = htmlspecialchars($product['SERIAL_NUMBER']);
        $modelId = htmlspecialchars($product['MODEL_ID']);
        $status = htmlspecialchars($product['PRODUCT_STATUS']);
        $modelName = htmlspecialchars($product['MODEL_NAME']);

        $subscriptionQuery = "SELECT S.SUBSCRIPTION_ID, S.CUSTOMER_ID, S.BEGIN_DATE, S.EXPIRED_DATE
                              FROM SUBSCRIPTION_PRODUCT SP
                              JOIN SUBSCRIPTION S ON SP.SUBSCRIPTION_ID = S.SUBSCRIPTION_ID
                              WHERE SP.SERIAL_NUMBER = :serial";
        $subscriptionStmt = oci_parse($conn, $subscriptionQuery);
        oci_bind_by_name($subscriptionStmt, ':serial', $serial);
        oci_execute($subscriptionStmt);

        $repairQuery = "SELECT VR.PROBLEM_DETAIL, VR.SOLUTION_DETAIL, V.WORKER_ID, V.VISIT_DATE
                        FROM PRODUCT P
                        JOIN SUBSCRIPTION_PRODUCT SP ON P.SERIAL_NUMBER = SP.SERIAL_NUMBER
                        JOIN SUBSCRIPTION S ON SP.SUBSCRIPTION_ID = S.SUBSCRIPTION_ID
                        JOIN REQUEST R ON S.SUBSCRIPTION_ID = R.SUBSCRIPTION_ID
                        JOIN VISIT V ON R.REQUEST_ID = V.REQUEST_ID
                        JOIN VISIT_REPAIR VR ON V.VISIT_ID = VR.VISIT_ID
                        WHERE P.SERIAL_NUMBER = :serial";
        $repairStmt = oci_parse($conn, $repairQuery);
        oci_bind_by_name($repairStmt, ':serial', $serial);
        oci_execute($repairStmt);
        ?>

        <div class="product-card">
            <img src="https://via.placeholder.com/100" alt="Product Image" class="product-image">
            <div class="product-details">
                <p><strong>시리얼 번호:</strong> <?= $serial ?></p>
                <p><strong>모델 ID:</strong> <?= $modelId ?></p>
                <p><strong>모델명:</strong> <?= $modelName ?></p>
                <p><strong>상태:</strong> <?= $status ?></p>
            </div>
            <div class="buttons">
                <button class="text-blue-500 hover:underline"
                    onclick="toggleDetails('subscription<?= $serial ?>')">구독기록</button>
                <button class="text-blue-500 hover:underline"
                    onclick="toggleDetails('repair<?= $serial ?>')">수리기록</button>
            </div>
        </div>

        <div id="subscription<?= $serial ?>" class="hidden mt-4">
            <h2 class="section-title">구독 기록</h2>
            <table class="min-w-full bg-white">
                <thead>
                    <tr>
                        <th class="py-2">구독번호</th>
                        <th class="py-2">고객ID</th>
                        <th class="py-2">시작일</th>
                        <th class="py-2">만료일</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($subscription = oci_fetch_array($subscriptionStmt, OCI_ASSOC + OCI_RETURN_NULLS)) { ?>
                        <tr>
                            <td class="border px-4 py-2"><?= htmlspecialchars($subscription['SUBSCRIPTION_ID']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($subscription['CUSTOMER_ID']) ?></td>
                            <td class="border px-4 py-2"><?= date('Y-m-d', strtotime($subscription['BEGIN_DATE'])) ?></td>
                            <td class="border px-4 py-2"><?= date('Y-m-d', strtotime($subscription['EXPIRED_DATE'])) ?></td>
                        </tr>
                    <?php } ?>
                </tbody>
            </table>
        </div>

        <div id="repair<?= $serial ?>" class="hidden mt-4">
            <h2 class="section-title">수리 기록</h2>
            <table class="min-w-full bg-white">
                <thead>
                    <tr>
                        <th class="py-2">고장내용</th>
                        <th class="py-2">수리내용</th>
                        <th class="py-2">기사 ID</th>
                        <th class="py-2">수리일자</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($repair = oci_fetch_array($repairStmt, OCI_ASSOC + OCI_RETURN_NULLS)) { ?>
                        <tr>
                            <td class="border px-4 py-2"><?= htmlspecialchars($repair['PROBLEM_DETAIL']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($repair['SOLUTION_DETAIL']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($repair['WORKER_ID']) ?></td>
                            <td class="border px-4 py-2"><?= date('Y-m-d', strtotime($repair['VISIT_DATE'])) ?></td>
                        </tr>
                    <?php } ?>
                </tbody>
            </table>
        </div>
    <?php }

    if (!$hasProducts) {
        echo "<p class='no-product-message'>존재하는 제품이 없습니다.</p>";
    }

    oci_free_statement($stmt);
    oci_close($conn);
    ?>
</div>

<script>
    function toggleDetails(id) {
        const element = document.getElementById(id);
        element.classList.toggle('hidden');
    }
</script>

<?php
include BASE_PATH . '/includes/footer.php';
?>
