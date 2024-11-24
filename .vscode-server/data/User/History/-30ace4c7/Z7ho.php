<?php
require '../../../config.php';
header('Content-Type: application/json; charset=UTF-8'); // JSON 형식 응답 설정

// 데이터베이스 연결 설정
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo json_encode(['error' => "Connection failed: " . htmlspecialchars($e['message'])], JSON_UNESCAPED_UNICODE);
    exit;
}

// AJAX 요청에서 JSON 데이터 가져오기
$data = json_decode(file_get_contents("php://input"), true);

// 기본 쿼리와 조건 초기화
$query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                 mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                 NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
          FROM MODEL_AIRCLEANER_SPEC mas
          JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
          LEFT JOIN MODEL_RATING mr ON mas.MODEL_ID = mr.SUBSCRIPTION_ID
          WHERE 1=1"; // 기본 조건 추가

$params = []; // 바인딩 파라미터 초기화

// 필터 조건 추가 - '필터 종류'
if (isset($data['필터 종류']) && !empty($data['필터 종류'])) {
    $filterTypes = implode("','", array_map('htmlspecialchars', $data['필터 종류']));
    $query .= " AND mas.FILTER_TYPE IN ('$filterTypes')";
}

// 필터 조건 추가 - 'PM 센서'
if (isset($data['PM 센서']) && !empty($data['PM 센서'])) {
    $pmSensors = implode("','", array_map('htmlspecialchars', $data['PM 센서']));
    $query .= " AND mas.PM_SENSOR IN ('$pmSensors')";
}

// 구독료 슬라이더 값 조건 추가
if (isset($data['subscription_min']) && isset($data['subscription_max'])) {
    $query .= " AND m.YEARLY_FEE BETWEEN :subscription_min AND :subscription_max";
    $params['subscription_min'] = $data['subscription_min'];
    $params['subscription_max'] = $data['subscription_max'];
}

// 그룹화 및 정렬
$query .= " GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
           mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
           ORDER BY mas.MODEL_ID ASC";

$stmt = oci_parse($conn, $query);

// 파라미터 바인딩
foreach ($params as $key => &$value) {
    oci_bind_by_name($stmt, ":$key", $value);
}

oci_execute($stmt);

$html = ''; // HTML 응답을 위한 변수 초기화
while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
    $avgRating = number_format($row['AVG_RATING'], 1);
    $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

    // 카드 HTML 생성
    $html .= "<div class='model-card bg-white p-8 rounded-lg shadow-lg'>";
    $html .= "<div class='flex justify-between items-center mb-4'>";
    $html .= "<h2 class='text-2xl font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . "</h2>";
    $html .= "<span class='text-md text-gray-500'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span>";
    $html .= "</div>";
    $html .= "<div class='flex items-center mb-4'>";
    $html .= "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</span>";
    $html .= "<div class='flex items-center ml-4'>";
    $html .= "<svg class='w-5 h-5 text-yellow-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>";
    $html .= "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.455a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.37-2.455a1 1 0 00-1.175 0l-3.37 2.455c-.784.57-1.838-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.98 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z'></path>";
    $html .= "</svg>";
    $html .= "<span class='ml-1 text-sm text-gray-500'>" . $avgRating . " (" . number_format($row['RATING_COUNT']) . ")</span>";
    $html .= "<button class='ml-2 text-sm text-green-600 border border-green-600 rounded px-2 py-1'>리뷰 보기</button>";
    $html .= "</div>";
    $html .= "</div>";

    $imagePath = TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($row['MODEL_ID']) . ".jpg";
    $html .= "<img src='" . $imagePath . "' alt='Product Image' class='w-full h-48 object-cover mb-4'>";

    $html .= "<ul class='text-sm text-gray-700 mb-4'>";
    $html .= "<li>필터 종류: " . htmlspecialchars($row['FILTER_TYPE']) . " · PM센서: " . htmlspecialchars($row['PM_SENSOR']) . "</li>";
    $html .= "<li>필터 등급: " . htmlspecialchars($row['FILTER_GRADE']) . " · 공기청정 면적: " . htmlspecialchars($row['COVERAGE_AREA']) . "m²</li>";
    $html .= "<li>에너지 등급: " . htmlspecialchars($row['ENERGY_RATING']) . " · 색상: " . htmlspecialchars($row['COLOR']) . "</li>";
    $html .= "</ul>";

    $html .= "<div class='text-lg font-bold mb-2'>연 " . number_format($row['YEARLY_FEE']) . " 원</div>";
    $html .= "<div class='text-sm text-gray-500 mb-4'>월 약 " . number_format($monthlyFee) . "원</div>";
    $html .= "<button class='w-full bg-green-600 text-white py-2 rounded'>구독 신청</button>";
    $html .= "</div>";
}

oci_free_statement($stmt);
oci_close($conn);

// JSON 응답 반환
echo json_encode(['html' => $html], JSON_UNESCAPED_UNICODE);
