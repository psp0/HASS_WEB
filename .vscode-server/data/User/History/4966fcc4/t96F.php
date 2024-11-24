<?php
header('Content-Type: application/json');

// DB 연결 설정
require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo json_encode(['error' => "연결 실패: " . htmlspecialchars($e['message'])]);
    exit;
}

// 필터 조건을 위한 WHERE 절 구성
$whereClauses = [];

if (!empty($_GET['filterType'])) {
    $filterTypeList = implode("','", array_map('htmlspecialchars', $_GET['filterType']));
    $whereClauses[] = "mas.FILTER_TYPE IN ('$filterTypeList')";
}

if (!empty($_GET['pmSensor'])) {
    $pmSensorList = implode("','", array_map('htmlspecialchars', $_GET['pmSensor']));
    $whereClauses[] = "mas.PM_SENSOR IN ('$pmSensorList')";
}

if (!empty($_GET['filterGrade'])) {
    $filterGradeList = implode("','", array_map('htmlspecialchars', $_GET['filterGrade']));
    $whereClauses[] = "mas.FILTER_GRADE IN ('$filterGradeList')";
}

if (!empty($_GET['coverageArea'])) {
    $coverageConditions = [];
    foreach ($_GET['coverageArea'] as $area) {
        if ($area == 'above100') $coverageConditions[] = "mas.COVERAGE_AREA >= 100";
        elseif ($area == '88-99') $coverageConditions[] = "mas.COVERAGE_AREA BETWEEN 88 AND 99";
        elseif ($area == '51-82') $coverageConditions[] = "mas.COVERAGE_AREA BETWEEN 51 AND 82";
        elseif ($area == 'below50') $coverageConditions[] = "mas.COVERAGE_AREA <= 50";
    }
    $whereClauses[] = '(' . implode(' OR ', $coverageConditions) . ')';
}

if (isset($_GET['minYearlyFee']) && isset($_GET['maxYearlyFee'])) {
    $whereClauses[] = "m.YEARLY_FEE BETWEEN " . intval($_GET['minYearlyFee']) . " AND " . intval($_GET['maxYearlyFee']);
}

if (!empty($_GET['manufacturer'])) {
    $manufacturerList = implode("','", array_map('htmlspecialchars', $_GET['manufacturer']));
    $whereClauses[] = "m.MANUFACTURER IN ('$manufacturerList')";
}

if (!empty($_GET['color'])) {
    $colorList = implode("','", array_map('htmlspecialchars', $_GET['color']));
    $whereClauses[] = "m.COLOR IN ('$colorList')";
}

if (!empty($_GET['energyRating'])) {
    $energyRatingList = implode("','", array_map('htmlspecialchars', $_GET['energyRating']));
    $whereClauses[] = "m.ENERGY_RATING IN ('$energyRatingList')";
}

if (!empty($_GET['releaseYear'])) {
    $releaseYearList = implode("','", array_map('htmlspecialchars', $_GET['releaseYear']));
    $whereClauses[] = "m.RELEASE_YEAR IN ('$releaseYearList')";
}

// WHERE 절 추가
$query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE,
                  mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE,
                  NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
          FROM MODEL_AIRCLEANER_SPEC mas
          JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
          LEFT JOIN SUBSCRIPTION s ON m.MODEL_ID = s.MODEL_ID
          LEFT JOIN MODEL_RATING mr ON s.SUBSCRIPTION_ID = mr.SUBSCRIPTION_ID";

if (count($whereClauses) > 0) {
    $query .= " WHERE " . implode(" AND ", $whereClauses);
}

$query .= " GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE,
                     mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
             ORDER BY mas.MODEL_ID ASC";

// 쿼리 실행 및 결과 반환
$stmt = oci_parse($conn, $query);
oci_execute($stmt);

// 결과를 HTML로 생성하여 JSON으로 반환
$html = '';
while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
    $avgRating = number_format($row['AVG_RATING'], 1);
    $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

    $html .= "<div class='model-card bg-white p-8 rounded-lg shadow-lg'>";
    $html .= "<div class='flex justify-between items-center mb-4'>";
    $html .= "<h2 class='text-xl font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . "</h2>";
    $html .= "<span class='text-md'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span>";
    $html .= "</div>";
    $html .= "<div class='flex items-center mb-4'>";
    $html .= "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</span>";
    $html .= "<div class='flex items-center ml-4'>";
    $html .= "<svg class='w-5 h-5 text-yellow-400' fill='#FFD700' stroke='#FFD700' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>";
    $html .= "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.950a1 1 0 00.950.690h4.162c.969 0 1.371 1.240.588 1.810l-3.370 2.455a1 1 0 00-.364 1.118l1.286 3.950c.3.921-.755 1.688-1.540 1.118l-3.370-2.455a1 1 0 00-1.175 0l-3.370 2.455c-.784.570-1.838-.197-1.540-1.118l1.286-3.950a1 1 0 00-.364-1.118L2.980 9.377c-.783-.570-.380-1.810.588-1.810h4.162a1 1 0 00.950-.690l1.286-3.950z'></path>";
    $html .= "</svg>";
    $html .= "<span class='ml-1 text-sm text-gray-500'>" . $avgRating . " (" . number_format($row['RATING_COUNT']) . ")</span>";
    $html .= "</div></div>";
    $html .= "<img src='" . TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($row['MODEL_ID']) . ".jpg' alt='Product Image' class='w-full h-48 object-cover mb-4'>";
    $html .= "<ul class='model-details text-gray-700 mb-4'>";
    $html .= "<li>필터 종류: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['FILTER_TYPE']) . "</span> · PM센서: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['PM_SENSOR']) . "</span></li>";
    $html .= "<li>필터 등급: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['FILTER_GRADE']) . "</span> · 공기청정 면적: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['COVERAGE_AREA']) . "m²</span></li>";
    $html .= "<li>에너지 등급: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['ENERGY_RATING']) . "</span> · 색상: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['COLOR']) . "</span></li>";
    $html .= "</ul>";
    $html .= "<div class='text-lg font-bold mb-2'>연 " . number_format($row['YEARLY_FEE']) . " 원</div>";
    $html .= "<div class='text-sm text-gray-500 mb-4'>월 약 " . number_format($monthlyFee) . "원</div>";
    $html .= "<button class='w-full bg-green-600 text-white py-2 rounded'>구독 신청</button>";
    $html .= "</div>";
}

oci_free_statement($stmt);
oci_close($conn);

echo json_encode(['html' => $html]);
?>
