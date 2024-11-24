<?php
// 설정 파일과 헤더 포함
$config = require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';

// 데이터베이스 연결 설정
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
  $e = oci_error();
  echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
  exit;
}

// 필터링 조건 설정
$modelType = $_GET['modelType'] ?? '';
$productStatus = $_GET['productStatus'] ?? '';
$serialNumber = $_GET['serialNumber'] ?? '';
?>
<div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
  <h1 class="text-2xl font-bold mb-4">제품 관리</h1>
  <!-- 필터링 폼 -->
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
        value="<?= htmlspecialchars($serialNumber) ?>" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
    </div>
    <button type="submit" class="mt-6 bg-blue-500 text-white px-5 py-3 rounded-md shadow-sm">검색</button>
    <button type="reset" class="mt-6 bg-blue-500 text-white px-2 py-1 rounded-md shadow-sm"
      onclick="location.href='product.php'">초기화</button>
  </form>

  <?php
  // 필터링 조건에 따른 쿼리 생성
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

  // 바인딩
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
    ?>

    <!-- 제품 정보 출력 -->
    <div class="space-y-4 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg shadow-sm product-info">
        <div class="product-details">
          <p><strong>시리얼 번호:</strong> <?= $serial ?></p>
          <p><strong>모델 ID:</strong> <?= $modelId ?></p>
          <p><strong>모델명: </strong> <?= $modelName ?></p>
          <p><strong>상태:</strong> <?= $status ?></p>
        </div>
      </div>
    </div>
  <?php }

  if (!$hasProducts) {
    echo "<p class='text-red-500 font-bold'>제품이 없습니다.</p>";
  }

  oci_free_statement($stmt);
  oci_close($conn);
  ?>
</div>
<?php
// Footer 포함
include BASE_PATH . '/includes/footer.php';
?>