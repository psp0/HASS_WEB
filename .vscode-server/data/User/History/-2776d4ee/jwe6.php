<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>제품 관리</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Noto Sans KR', sans-serif;
        }

        .product-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .product-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .product-image {
            width: 120px;
            height: 120px;
        }

        .buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;
            position: relative;
            top: 10px;
            left: 10px;
        }

        .section-title {
            color: #1D4ED8;
            font-weight: bold;
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .no-product-message {
            font-size: 1.5rem;
            font-weight: bold;
            color: red;
            text-align: center;
            margin-top: 20px;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
</head>

<body class="bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">

        <?php
        $config = require '../../../config.php';
        include BASE_PATH . '/includes/worker_header.php';
        $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
        $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

        if (!$conn) {
            $e = oci_error();
            echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
            exit;
        }

        $modelType = $_GET['modelType'] ?? '';
        $productStatus = $_GET['productStatus'] ?? '';
        $serialNumber = $_GET['serialNumber'] ?? '';
        ?>
        <h1 class="text-2xl font-bold mb-4">제품 관리</h1>
        <form method="GET" action="" class="flex items-center space-x-4 mb-6">
            <div>
                <label for="modelType" class="block text-sm font-medium text-gray-700">모델 타입:</label>
                <select name="modelType" id="modelType" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="" <?= $modelType == '' ? 'selected' : '' ?>>전체</option>
                    <option value="공기청정기" <?= $modelType == '공기청정기' ? 'selected' : '' ?>>공기청정기</option>
                    <option value="건조기" <?= $modelType == '건조기' ? 'selected' : '' ?>>건조기</option>
                    <option value="TV" <?= $modelType == 'TV' ? 'selected' : '' ?>>TV</option>
                    <option value="세탁기" <?= $modelType == '세탁기' ? 'selected' : '' ?>>세탁기</option>
                </select>
            </div>
            <div>
                <label for="productStatus" class="block text-sm font-medium text-gray-700">제품 상태:</label>
                <select name="productStatus" id="productStatus"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="" <?= $productStatus == '' ? 'selected' : '' ?>>전체</option>
                    <option value="재고" <?= $productStatus == '재고' ? 'selected' : '' ?>>재고</option>
                    <option value="구독대기" <?= $productStatus == '구독대기' ? 'selected' : '' ?>>구독대기</option>
                    <option value="구독중" <?= $productStatus == '구독중' ? 'selected' : '' ?>>구독중</option>
                </select>
            </div>
            <div class="flex-1">
                <label for="serialNumber" class="block text-sm font-medium text-gray-700">시리얼번호:</label>
                <input type="text" name="serialNumber" id="serialNumber" placeholder="시리얼번호 검색"
                    value="<?= htmlspecialchars($serialNumber) ?>"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            </div>
            <button type="submit" class="mt-6 bg-blue-500 text-white px-5 py-3 rounded-md shadow-sm">검색</button>
            <button type="reset" class="mt-6 bg-blue-500 text-white px-2 py-1 rounded-md shadow-sm"
                onclick="location.href='product.php'">초기화</button>
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

            <div class="space-y-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg shadow-sm product-info">
                    <img src="https://via.placeholder.com/100" alt="Product Image" class="product-image">
                    <div class="product-details">
                        <p><strong>시리얼 번호:</strong> <?= $serial ?></p>
                        <p><strong>모델 ID:</strong> <?= $modelId ?> <span class="text-gray-600">-- <?= $modelName ?></span></p>
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
            </div>
        <?php }


        if (!$hasProducts) {  
            echo "<p class='no-product-message'>존재하는 제품이 없습니다.</p>";
        }

        oci_free_statement($stmt);
        oci_close($conn);
        include BASE_PATH . '/includes/footer.php';
        ?>
    </div>

    <script>
        function toggleDetails(id) {
            const element = document.getElementById(id);
            element.classList.toggle('hidden');
        }
    </script>
</body>
</html>