<?php
require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
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

<div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">

    <?php
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
            <select name="productStatus" id="productStatus" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
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
    // 데이터베이스 쿼리 및 실행 로직
    // 제품, 구독, 수리 기록과 관련된 쿼리 및 데이터 처리 코드를 여기 넣으시면 됩니다.
    ?>

</div>

<script>
    function toggleDetails(id) {
        const element = document.getElementById(id);
        element.classList.toggle('hidden');
    }
</script>

<?php
oci_free_statement($stmt);
oci_close($conn);
include BASE_PATH . '/includes/footer.php';
?>
