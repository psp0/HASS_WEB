<?php
require '../../../config.php';

// AJAX 요청인지 확인
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
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
    exit;
}

// AJAX 요청이 아닐 경우 HTML 코드 반환
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        body,
        html {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            font-family: Arial, sans-serif;
            height: 100%;
        }

        .main-container {
            display: flex;
            flex-direction: row;
            flex-grow: 1;
            width: 100%;
            height: calc(100vh - 80px);
        }

        .filter-panel {
            width: 25%;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 15px;
            background-color: #ffffff;
        }

        .content-panel {
            flex-grow: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .accordion {
            background-color: #ffffff;
            color: #222;
            cursor: pointer;
            padding: 8px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 14px;
            border-bottom: 1px solid #ddd;
            position: relative;
        }

        .accordion:after {
            content: '\25BC';
            /* 아래쪽 화살표 아이콘 */
            color: #888;
            font-weight: bold;
            float: right;
            margin-left: 5px;
        }

        .active:after {
            content: "\25B2";
            /* 활성화 시 위쪽 화살표 아이콘 */
        }

        .panel {
            padding: 0 10px;
            /* 패딩을 조절하여 닫힌 상태에서도 내용이 보이지 않게 함 */
            background-color: white;
            max-height: 0;
            /* 최대 높이를 0으로 설정하여 완전히 숨김 */
            overflow: hidden;
            /* 내용이 max-height을 초과할 때 숨김 */
            transition: max-height 0.2s ease-out;
            /* 부드러운 전환 효과 */
        }

        .checkbox-group {
            padding: 5px 0;
            display: flex;
            flex-direction: column;
        }

        .checkbox-group label {
            margin-bottom: 5px;
        }

        .slider {
            margin-top: 5px;
        }

        .noUi-target,
        .noUi-target * {
            border-radius: 50px;
        }

        .noUi-base {
            background-color: #ccc;
        }

        .noUi-connect {
            background-color: #0a0a0a;
        }

        .noUi-handle {
            background-color: #fff;
            border: 1px solid #000;
            width: 12px;
            height: 12px;
            top: -4px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .slider-value {
            font-size: 12px;
            margin-top: 5px;
        }

        .selected-filters {
            display: flex;
            gap: 10px;
            margin: 10px 0;
            align-items: center;
        }

        .filter-tag {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 5px 10px;
            display: flex;
            align-items: center;
        }

        .filter-tag span {
            margin-right: 5px;
        }

        .remove-filter {
            cursor: pointer;
            color: #ff0000;
        }

        #reset-filters {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }

        .model-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }

        .data-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: flex-start;
            /* 카드들을 왼쪽 정렬 */
            width: 100%;
        }

        .model-card {
            flex: 1 1 calc(33.333% - 15px);
            /* 부모의 3분의 1로 조정 */
            box-sizing: border-box;
            min-width: 250px;
            max-width: 33.333%;
            margin-bottom: 20px;
        }

        .model-card img {
            width: 90%;
            height: auto;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>
    <!-- 필터 및 데이터 표시 HTML 구조 생략 -->

    <script>
        // JavaScript: AJAX 요청 및 필터 적용
        function applyFilters() {
            const filters = collectFilters();
            fetch('air_test.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(filters)
            })
                .then(response => response.json())
                .then(data => {
                    document.querySelector('.data-container').innerHTML = data.html;
                })
                .catch(error => console.error('Error:', error));
        }
        // 필터 이벤트 리스너 설정 및 슬라이더 초기화
    </script>
</body>

</html>