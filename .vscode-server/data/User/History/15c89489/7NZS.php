<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <title>Air Cleaner Model Filter</title>
    <style>
        /* 스타일링 추가 */
    </style>
</head>

<body>
    <div class="main-container">
        <!-- 필터 패널 (체크박스 및 슬라이더) -->
        <div class="filter-panel">
            <!-- 필터 종류 -->
            <div class="accordion">필터 종류</div>
            <div class="checkbox-group">
                <label><input type="checkbox" name="filter_type[]" value="flat"> 판형</label>
                <label><input type="checkbox" name="filter_type[]" value="cylindrical"> 원통형</label>
            </div>

            <!-- PM 센서 -->
            <div class="accordion">PM 센서</div>
            <div class="checkbox-group">
                <label><input type="checkbox" name="pm_sensor[]" value="PM10"> PM10</label>
                <label><input type="checkbox" name="pm_sensor[]" value="PM2.5"> PM 2.5</label>
                <label><input type="checkbox" name="pm_sensor[]" value="PM1"> PM 1</label>
            </div>

            <!-- 필터 등급 -->
            <div class="accordion">필터 등급</div>
            <div class="checkbox-group">
                <label><input type="checkbox" name="filter_grade[]" value="E"> E (10~12)</label>
                <label><input type="checkbox" name="filter_grade[]" value="H"> H (13~14)</label>
                <label><input type="checkbox" name="filter_grade[]" value="U"> U (15~17)</label>
            </div>

            <!-- 공기청정 면적 -->
            <div class="accordion">공기청정 면적</div>
            <div class="checkbox-group">
                <label><input type="checkbox" name="coverage_area[]" value="above100"> 100m² 이상</label>
                <label><input type="checkbox" name="coverage_area[]" value="88-99"> 88 ~ 99m²</label>
                <label><input type="checkbox" name="coverage_area[]" value="51-82"> 51 ~ 82m²</label>
                <label><input type="checkbox" name="coverage_area[]" value="below50"> 50m² 이하</label>
            </div>

            <!-- 연 구독료 슬라이더 -->
            <div style="padding: 10px;">
                <label for="subscription_slider">연 구독료:</label>
                <input type="range" id="subscription_slider" min="0" max="1000" step="10" value="500">
                <span id="subscription_value">500</span>
            </div>

            <!-- 필터링 버튼 -->
            <button onclick="applyFilter()">필터 적용</button>
        </div>

        <div id="results"></div>
    </div>

    <script>
        // 슬라이더 값 표시
        const slider = document.getElementById("subscription_slider");
        const sliderValue = document.getElementById("subscription_value");
        slider.oninput = () => sliderValue.textContent = slider.value;

        // 필터 적용 함수
        function applyFilter() {
            const formData = new FormData();

            // 체크박스 값 수집
            document.querySelectorAll('.checkbox-group input:checked').forEach(input => {
                formData.append(input.name, input.value);
            });

            // 슬라이더 값 추가
            formData.append('subscription_fee', slider.value);

            // AJAX 요청
            fetch("filter.php", {
                method: "POST",
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    document.getElementById("results").innerHTML = data;
                })
                .catch(error => console.error('Error:', error));
        }
    </script>
</body>

</html>
<?php
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

// 기본 쿼리
$query = "
    SELECT M.MODEL_ID, M.MODEL_NAME, M.MODEL_TYPE, M.YEARLY_FEE, M.MANUFACTURER, M.COLOR, M.ENERGY_RATING, M.RELEASE_YEAR
    FROM MODEL M
    JOIN MODEL_AIRCLEANER_SPEC A ON M.MODEL_ID = A.MODEL_ID
    WHERE 1 = 1
";

// 필터 조건 추가
$params = [];
if (isset($_POST['filter_type'])) {
    $placeholders = implode(',', array_fill(0, count($_POST['filter_type']), '?'));
    $query .= " AND A.FILTER_TYPE IN ($placeholders)";
    $params = array_merge($params, $_POST['filter_type']);
}

if (isset($_POST['pm_sensor'])) {
    $placeholders = implode(',', array_fill(0, count($_POST['pm_sensor']), '?'));
    $query .= " AND A.PM_SENSOR IN ($placeholders)";
    $params = array_merge($params, $_POST['pm_sensor']);
}

if (isset($_POST['filter_grade'])) {
    $placeholders = implode(',', array_fill(0, count($_POST['filter_grade']), '?'));
    $query .= " AND A.FILTER_GRADE IN ($placeholders)";
    $params = array_merge($params, $_POST['filter_grade']);
}

// 공기청정 면적 필터링
if (isset($_POST['coverage_area'])) {
    $coverageConditions = [];
    foreach ($_POST['coverage_area'] as $area) {
        switch ($area) {
            case 'above100':
                $coverageConditions[] = "A.COVERAGE_AREA >= 100";
                break;
            case '88-99':
                $coverageConditions[] = "A.COVERAGE_AREA BETWEEN 88 AND 99";
                break;
            case '51-82':
                $coverageConditions[] = "A.COVERAGE_AREA BETWEEN 51 AND 82";
                break;
            case 'below50':
                $coverageConditions[] = "A.COVERAGE_AREA <= 50";
                break;
        }
    }
    if ($coverageConditions) {
        $query .= " AND (" . implode(" OR ", $coverageConditions) . ")";
    }
}

// 연 구독료 슬라이더 값 필터링
if (isset($_POST['subscription_fee']) && is_numeric($_POST['subscription_fee'])) {
    $query .= " AND M.YEARLY_FEE <= ?";
    $params[] = $_POST['subscription_fee'];
}

// 쿼리 실행
$stmt = $pdo->prepare($query);
$stmt->execute($params);

// 결과 출력
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
if ($results) {
    foreach ($results as $row) {
        echo "<p>Model ID: " . htmlspecialchars($row['MODEL_ID']) . ", Name: " . htmlspecialchars($row['MODEL_NAME']) . "</p>";
    }
} else {
    echo "<p>조건에 맞는 모델이 없습니다.</p>";
}
?>