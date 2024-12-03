<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>

<link rel="stylesheet" href="./worker_product.css">

<div class="container">

    <?php
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

    if (!$conn) {
        $e = oci_error();
        echo "<p class='error-message'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
        exit;
    }
    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'worker') {
        echo "<script>alert('기사 전용 페이지 입니다. 기사 로그인을 해주세요.');</script>";
        echo "<script>location.href='" . TEAM_PATH . "/pages/login/worker_login.php';</script>";
        exit;
    }

    $modelType = $_GET['modelType'] ?? '';
    $productStatus = $_GET['productStatus'] ?? '';
    $serialNumber = $_GET['serialNumber'] ?? '';
    ?>

    <h1 class="title">제품 관리</h1>
    <form method="GET" action="" class="form-row">
        <div class="form-group">
            <label for="modelType">모델 타입:</label>
            <select name="modelType" id="modelType">
                <option value="" <?= $modelType == '' ? 'selected' : '' ?>>전체</option>
                <option value="공기청정기" <?= $modelType == '공기청정기' ? 'selected' : '' ?>>공기청정기</option>
                <option value="건조기" <?= $modelType == '건조기' ? 'selected' : '' ?>>건조기</option>
                <option value="TV" <?= $modelType == 'TV' ? 'selected' : '' ?>>TV</option>
                <option value="세탁기" <?= $modelType == '세탁기' ? 'selected' : '' ?>>세탁기</option>
            </select>
        </div>
        <div class="form-group">
            <label for="productStatus">제품 상태:</label>
            <select name="productStatus" id="productStatus">
                <option value="" <?= $productStatus == '' ? 'selected' : '' ?>>전체</option>
                <option value="재고" <?= $productStatus == '재고' ? 'selected' : '' ?>>재고</option>
                <option value="구독대기" <?= $productStatus == '구독대기' ? 'selected' : '' ?>>구독대기</option>
                <option value="구독중" <?= $productStatus == '구독중' ? 'selected' : '' ?>>구독중</option>
            </select>
        </div>
        <div class="form-group">
            <label for="serialNumber">시리얼번호:</label>
            <input type="text" name="serialNumber" id="serialNumber" placeholder="시리얼번호 검색"
                value="<?= htmlspecialchars($serialNumber) ?>">
        </div>
        <div class="button-group">
            <button type="submit" class="button">검색</button>
            <button type="reset" class="button-reset" onclick="location.href='product.php'">초기화</button>
        </div>
    </form>

    <div class="product-list">
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


            $subscriptionQuery = "SELECT 
            SUBSCRIPTION_ID, CUSTOMER_ID, TO_CHAR(BEGIN_DATE, 'YYYY-MM-DD HH24:MI:SS') AS BEGIN_DATE, 
            TO_CHAR(EXPIRED_DATE, 'YYYY-MM-DD HH24:MI:SS') AS EXPIRED_DATE
            FROM SUBSCRIPTION
            WHERE SERIAL_NUMBER = :serial";

            $subscriptionStmt = oci_parse($conn, $subscriptionQuery);
            oci_bind_by_name($subscriptionStmt, ':serial', $serial);
            oci_execute($subscriptionStmt);
            ?>

            <div class="product-item">
                <div class="product-card">
                    <?php
                    $imagePath = BASE_PATH . "/pages/customer/model/model_img/model{$modelId}.jpg";
                    $imageUrl = file_exists($imagePath) ? TEAM_PATH . "/pages/customer/model/model_img/model{$modelId}.jpg" : 'https://via.placeholder.com/100';
                    ?>
                    <img src="<?= $imageUrl ?>" alt="Product Image" class="product-image">

                    <div class="product-details">
                        <p><strong>시리얼 번호:</strong> <?= $serial ?></p>
                        <p><strong>모델 ID:</strong> <?= $modelId ?></p>
                        <p><strong>모델명:</strong> <?= $modelName ?></p>
                        <p><strong>상태:</strong> <?= $status ?></p>
                    </div>
                    <div class="product-buttons">
                        <button class="toggle-button"
                            onclick="toggleDetails('subscription<?= $serial ?>')">구독기록</button>
                    </div>
                </div>

                <div id="subscription<?= $serial ?>" class="subscription-details">
                    <h2 class="section-title">구독 기록</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>구독번호</th>
                                <th>고객ID</th>
                                <th>시작일</th>
                                <th>만료일</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php while ($subscription = oci_fetch_array($subscriptionStmt, OCI_ASSOC + OCI_RETURN_NULLS)) { ?>
                                <tr>
                                    <td><?= htmlspecialchars($subscription['SUBSCRIPTION_ID']) ?></td>
                                    <td><?= htmlspecialchars($subscription['CUSTOMER_ID']) ?></td>
                                    <td><?= htmlspecialchars($subscription['BEGIN_DATE'] ?? 'NULL') ?></td>
                                    <td><?= htmlspecialchars($subscription['EXPIRED_DATE'] ?? 'NULL') ?></td>
                                </tr>
                            <?php } ?>
                        </tbody>
                    </table>
                </div>
            </div>

        <?php }

        if (!$hasProducts) {
            echo "<p class='no-product-message'>존재하는 제품이 없습니다.</p>";
        }

        oci_free_statement($stmt);
        oci_close($conn);
        ?>
    </div>
</div>

<script>
    function toggleDetails(id) {
        const element = document.getElementById(id);
        element.classList.toggle('active');
    }
</script>

<?php
include BASE_PATH . '/includes/footer.php';
?>
