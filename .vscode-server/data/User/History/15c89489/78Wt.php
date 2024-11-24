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
            fetch("http://203.249.87.58/2_team/2_team5/jinhyung/pages/customer/model/test.php", {
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
// Database connection setup
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

$query = "SELECT * FROM MODEL M 
JOIN MODEL_AIRCLEANER_SPEC S ON M.MODEL_ID = S.MODEL_ID WHERE 1=1";
if (!empty($_POST['filter_type'])) {
    $filterType = $_POST['filter_type'];
    $query .= " AND FILTER_TYPE = '" . htmlspecialchars($filterType) . "'";
}
if (!empty($_POST['pm_sensor'])) {
    $pmSensor = $_POST['pm_sensor'];
    $query .= " AND PM_SENSOR = '" . htmlspecialchars($pmSensor) . "'";
}
if (!empty($_POST['filter_grade'])) {
    $grades = implode("', '", array_map('htmlspecialchars', $_POST['filter_grade']));
    $query .= " AND S.FILTER_GRADE IN ('$grades')";
}
if (!empty($_POST['coverage_area'])) {
    foreach ($_POST['coverage_area'] as $area) {
        if ($area === 'above100')
            $query .= " AND S.COVERAGE_AREA >= 100";
        elseif ($area === '88-99')
            $query .= " AND S.COVERAGE_AREA BETWEEN 88 AND 99";
        elseif ($area === '51-82')
            $query .= " AND S.COVERAGE_AREA BETWEEN 51 AND 82";
        elseif ($area === 'below50')
            $query .= " AND S.COVERAGE_AREA < 50";
    }
}
if (!empty($_POST['yearly_fee'])) {
    $query .= " AND M.YEARLY_FEE <= " . (int) $_POST['yearly_fee'];
}
if (!empty($_POST['manufacturer'])) {
    $manufacturers = implode("', '", array_map('htmlspecialchars', $_POST['manufacturer']));
    $query .= " AND M.MANUFACTURER IN ('$manufacturers')";
}
if (!empty($_POST['color'])) {
    $colors = implode("', '", array_map('htmlspecialchars', $_POST['color']));
    $query .= " AND M.COLOR IN ('$colors')";
}
if (!empty($_POST['energy_rating'])) {
    $ratings = implode("', '", array_map('htmlspecialchars', $_POST['energy_rating']));
    $query .= " AND M.ENERGY_RATING IN ('$ratings')";
}
if (!empty($_POST['release_year'])) {
    foreach ($_POST['release_year'] as $year) {
        if ($year === 'before2020')
            $query .= " AND M.RELEASE_YEAR < 2020";
        else
            $query .= " AND M.RELEASE_YEAR = " . (int) $year;
    }
}

// Prepare and execute the query
$stmt = oci_parse($conn, $query);
oci_execute($stmt);

while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
    echo "<div class='data-row'>";
    foreach ($row as $column => $value) {
        echo "<div class='data-field'><span class='label'>" . htmlspecialchars($column) . "은(는)</span> <span class='value'>" . htmlspecialchars($value) . "</span></div>";
    }
    echo "</div>";
}

// Free resources
oci_free_statement($stmt);
oci_close($conn);
?>