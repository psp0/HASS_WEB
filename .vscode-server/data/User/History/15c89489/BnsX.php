<?php
require '../../../config.php';

// 데이터베이스 연결 설정
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p>Connection failed: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

// 필터 조건 초기화
$filterConditions = [];
$params = [];

// 필터 종류 필터
if (!empty($_GET['filter_type'])) {
    $filterTypes = implode("','", array_map('htmlspecialchars', $_GET['filter_type']));
    $filterConditions[] = "mas.FILTER_TYPE IN ('$filterTypes')";
}

// PM 센서 필터
if (!empty($_GET['pm_sensor'])) {
    $pmSensors = implode("','", array_map('htmlspecialchars', $_GET['pm_sensor']));
    $filterConditions[] = "mas.PM_SENSOR IN ('$pmSensors')";
}

// 연 구독료 필터
if (!empty($_GET['subscription_min']) && !empty($_GET['subscription_max'])) {
    $filterConditions[] = "m.YEARLY_FEE BETWEEN :subscription_min AND :subscription_max";
    $params['subscription_min'] = $_GET['subscription_min'];
    $params['subscription_max'] = $_GET['subscription_max'];
}

// 필터 조건을 쿼리에 추가
$query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                 mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                 NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
          FROM MODEL_AIRCLEANER_SPEC mas
          JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
          LEFT JOIN MODEL_RATING mr ON mas.MODEL_ID = mr.SUBSCRIPTION_ID
          WHERE 1=1";

// 필터 조건을 쿼리에 추가
if (!empty($filterConditions)) {
    $query .= " AND " . implode(" AND ", $filterConditions);
}

$query .= " GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
            mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
            ORDER BY mas.MODEL_ID ASC";

$stmt = oci_parse($conn, $query);

// 바인딩
foreach ($params as $key => &$value) {
    oci_bind_by_name($stmt, ":$key", $value);
}

oci_execute($stmt);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Air Cleaner Filter</title>
    <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body>
    <h1 class="text-3xl font-bold my-5 text-center">공기 청정기</h1>

    <div class="main-container flex">
        <!-- 필터 패널 -->
        <div class="filter-panel p-5 w-1/4 bg-gray-100 border-r">
            <form method="GET" action="air_test.php">
                <div>
                    <h2 class="font-bold">필터 종류</h2>
                    <label><input type="checkbox" name="filter_type[]" value="flat" <?= in_array('flat', $_GET['filter_type'] ?? []) ? 'checked' : '' ?>> 판형</label><br>
                    <label><input type="checkbox" name="filter_type[]" value="cylindrical" <?= in_array('cylindrical', $_GET['filter_type'] ?? []) ? 'checked' : '' ?>> 원통형</label>
                </div>

                <div>
                    <h2 class="font-bold mt-4">PM 센서</h2>
                    <label><input type="checkbox" name="pm_sensor[]" value="PM10" <?= in_array('PM10', $_GET['pm_sensor'] ?? []) ? 'checked' : '' ?>> PM10</label><br>
                    <label><input type="checkbox" name="pm_sensor[]" value="PM2.5" <?= in_array('PM2.5', $_GET['pm_sensor'] ?? []) ? 'checked' : '' ?>> PM2.5</label><br>
                    <label><input type="checkbox" name="pm_sensor[]" value="PM1" <?= in_array('PM1', $_GET['pm_sensor'] ?? []) ? 'checked' : '' ?>> PM1</label>
                </div>

                <div>
                    <h2 class="font-bold mt-4">연 구독료</h2>
                    <label>최소 구독료: <input type="number" name="subscription_min" value="<?= htmlspecialchars($_GET['subscription_min'] ?? '10000') ?>"></label><br>
                    <label>최대 구독료: <input type="number" name="subscription_max" value="<?= htmlspecialchars($_GET['subscription_max'] ?? '100000') ?>"></label>
                </div>

                <button type="submit" class="mt-5 bg-blue-500 text-white px-4 py-2">필터 적용</button>
            </form>
        </div>

        <!-- 데이터 표시 패널 -->
        <div class="content-panel p-5 w-3/4">
            <div id="model-container" class="data-container grid grid-cols-3 gap-4">
                <?php
                // 데이터 출력
                while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
                    $avgRating = number_format($row['AVG_RATING'], 1);
                    $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

                    echo "<div class='model-card bg-white p-8 rounded-lg shadow-lg'>";
                    echo "<h2 class='text-2xl font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . "</h2>";
                    echo "<span class='text-md text-gray-500'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span><br>";
                    echo "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</span>";
                    echo "<ul class='text-sm text-gray-700 mb-4'>";
                    echo "<li>필터 종류: " . htmlspecialchars($row['FILTER_TYPE']) . " · PM센서: " . htmlspecialchars($row['PM_SENSOR']) . "</li>";
                    echo "<li>필터 등급: " . htmlspecialchars($row['FILTER_GRADE']) . " · 공기청정 면적: " . htmlspecialchars($row['COVERAGE_AREA']) . "m²</li>";
                    echo "<li>에너지 등급: " . htmlspecialchars($row['ENERGY_RATING']) . " · 색상: " . htmlspecialchars($row['COLOR']) . "</li>";
                    echo "</ul>";
                    echo "<div class='text-lg font-bold mb-2'>연 " . number_format($row['YEARLY_FEE']) . " 원</div>";
                    echo "<div class='text-sm text-gray-500 mb-4'>월 약 " . number_format($monthlyFee) . "원</div>";
                    echo "<button class='w-full bg-green-600 text-white py-2 rounded'>구독 신청</button>";
                    echo "</div>";
                }
                oci_free_statement($stmt);
                oci_close($conn);
                ?>
            </div>
        </div>
    </div>
</body>
</html>
