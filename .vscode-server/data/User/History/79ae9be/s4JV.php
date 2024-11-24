<?php
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.css" rel="stylesheet">
<style>
  body,
  html {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
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
    width: 280px;
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
    color: #888;
    font-weight: bold;
    float: right;
    margin-left: 5px;
  }

  .accordion.active:after {
    content: "\25B2";
  }

  .panel {
    padding: 0 10px;
    background-color: white;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
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
    width: 100%;
  }

  .model-card {
    width: 380px;
    box-sizing: border-box;
    margin-bottom: 20px;
  }

  .model-card img {
    width: 90%;
    height: auto;
    margin-bottom: 10px;
  }

  #review-modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    justify-content: center;
    align-items: center;
  }

  #review-modal.show {
    display: flex;
  }

  .content-container {
    background: #ffffff;
    max-width: 60%;
    width: 60%;
    margin: 0 auto;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  /* Rating Section */
  .rating-score-container {
    text-align: center;
    margin-bottom: 20px;
  }

  .rating-score {
    font-size: 64px;
    font-weight: bold;
    color: #333;
    line-height: 1.2;
  }

  .stars {
    color: gold;
    font-size: 32px;
  }

  .rating-distribution h4 {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }

  .rating-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .rating-bar .rating-label {
    font-size: 14px;
    color: #555;
    margin-right: 10px;
  }

  .rating-bar .bar {
    background-color: #ddd;
    flex: 1;
    height: 10px;
    border-radius: 5px;
  }

  .rating-bar .bar-fill {
    background-color: #ffcc00;
    height: 100%;
    border-radius: 5px;
  }

  .rating-bar .rating-count {
    margin-left: 10px;
    font-size: 14px;
    color: #666;
  }

  .review-header h3 {
    font-size: 18px;
    font-weight: bold;
  }

  .review-header select {
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  /* Reviews Section */
  .review-item {
    padding: 15px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
  }

  .review-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .review-details .stars {
    font-size: 16px;
    color: gold;
  }

  .review-text {
    margin-top: 10px;
    font-size: 14px;
    color: #555;
    line-height: 1.5;
  }

  #close-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #888;
  }

  #close-modal:hover {
    color: #333;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    /* 제목과 정렬 옵션을 양쪽으로 배치 */
    align-items: center;
    /* 세로 정렬 */
    margin-bottom: 20px;
  }

  .review-header h3 {
    font-size: 1.25rem;
    /* 제목 크기 */
    font-weight: bold;
    /* 굵게 표시 */
    color: #333;
  }

  .review-header form {
    display: flex;
    align-items: center;
    gap: 8px;
    /* 라벨과 드롭다운 사이 간격 */
  }

  .review-header select {
    padding: 4px 8px;
    /* 패딩 줄이기 */
    font-size: 0.875rem;
    /* 폰트 크기를 조금 작게 설정 */
    border-radius: 4px;
    /* 모서리를 약간 둥글게 */
    border: 1px solid #ccc;
    /* 테두리 색상 변경 */
    width: auto;
    /* 박스 크기를 내용에 맞춤 */
    height: auto;
    /* 높이를 내용에 맞춤 */
  }
</style>
<div id="review-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div class="content-container relative">
    <button id="close-modal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">
      &times;
    </button>
    <div id="review-modal-content">

      <p class="text-center text-gray-500">Loading...</p>
    </div>
  </div>
</div>

<div class="main-container">
  <div class="filter-panel">
    <form method="GET" action="">
      <div class="accordion">필터 종류</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="filter_type[]" value="판형" <?php if (isset($_GET['filter_type']) && in_array('판형', $_GET['filter_type']))
            echo 'checked'; ?>>판형</label>
          <label><input type="checkbox" name="filter_type[]" value="원통형" <?php if (isset($_GET['filter_type']) && in_array('원통형', $_GET['filter_type']))
            echo 'checked'; ?>>원통형</label>
        </div>
      </div>

      <div class="accordion">PM 센서</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="pm_sensor[]" value="PM10" <?php if (isset($_GET['pm_sensor']) && in_array('PM10', $_GET['pm_sensor']))
            echo 'checked'; ?>>PM10</label>
          <label><input type="checkbox" name="pm_sensor[]" value="PM2.5" <?php if (isset($_GET['pm_sensor']) && in_array('PM2.5', $_GET['pm_sensor']))
            echo 'checked'; ?>>PM2.5</label>
          <label><input type="checkbox" name="pm_sensor[]" value="PM1" <?php if (isset($_GET['pm_sensor']) && in_array('PM1', $_GET['pm_sensor']))
            echo 'checked'; ?>>PM1</label>
        </div>
      </div>

      <div class="accordion">필터 등급</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="filter_grade[]" value="E10-E12" <?php if (isset($_GET['filter_grade']) && in_array('E10-E12', $_GET['filter_grade']))
            echo 'checked'; ?>>E(10-12)</label>
          <label><input type="checkbox" name="filter_grade[]" value="H13-H14" <?php if (isset($_GET['filter_grade']) && in_array('H13-H14', $_GET['filter_grade']))
            echo 'checked'; ?>>H(13-14)</label>
          <label><input type="checkbox" name="filter_grade[]" value="U15-U17" <?php if (isset($_GET['filter_grade']) && in_array('U15-U17', $_GET['filter_grade']))
            echo 'checked'; ?>>U(15-17)</label>
        </div>
      </div>


      <div class="accordion">공기청정 면적</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="coverage_area[]" value="over100" <?php if (isset($_GET['coverage_area']) && in_array('over100', $_GET['coverage_area']))
            echo 'checked'; ?>>100m² 초과</label>
          <label><input type="checkbox" name="coverage_area[]" value="more71-below100" <?php if (isset($_GET['coverage_area']) && in_array('more71-below100', $_GET['coverage_area']))
            echo 'checked'; ?>>71m² 이상 - 100m² 이하</label>
          <label><input type="checkbox" name="coverage_area[]" value="more50-under71" <?php if (isset($_GET['coverage_area']) && in_array('more50-under71', $_GET['coverage_area']))
            echo 'checked'; ?>>50m² 이상 - 71m² 미만</label>
          <label><input type="checkbox" name="coverage_area[]" value="under50" <?php if (isset($_GET['coverage_area']) && in_array('under50', $_GET['coverage_area']))
            echo 'checked'; ?>>50m² 미만</label>
        </div>
      </div>

      <div style="padding: 10px;">
        <label for="subscription-slider">연 구독료</label>
        <div id="subscription-slider" class="slider"></div>
        <span id="subscription-value" class="slider-value"></span>
        <input type="hidden" id="yearly_fee_min" name="yearly_fee_min"
          value="<?php echo isset($_GET['yearly_fee_min']) ? htmlspecialchars($_GET['yearly_fee_min']) : $minFee; ?>">
        <input type="hidden" id="yearly_fee_max" name="yearly_fee_max"
          value="<?php echo isset($_GET['yearly_fee_max']) ? htmlspecialchars($_GET['yearly_fee_max']) : $maxFee; ?>">
      </div>

      <div class="accordion">제조사</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="manufacturer[]" value="Samsung" <?php if (isset($_GET['manufacturer']) && in_array('Samsung', $_GET['manufacturer']))
            echo 'checked'; ?>>Samsung</label>
          <label><input type="checkbox" name="manufacturer[]" value="LG" <?php if (isset($_GET['manufacturer']) && in_array('LG', $_GET['manufacturer']))
            echo 'checked'; ?>>LG</label>
          <label><input type="checkbox" name="manufacturer[]" value="그 외" <?php if (isset($_GET['manufacturer']) && in_array('그 외', $_GET['manufacturer']))
            echo 'checked'; ?>>그 외</label>
        </div>
      </div>

      <div class="accordion">색상</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="color[]" value="블랙" <?php if (isset($_GET['color']) && in_array('블랙', $_GET['color']))
            echo 'checked'; ?>>블랙</label>
          <label><input type="checkbox" name="color[]" value="화이트" <?php if (isset($_GET['color']) && in_array('화이트', $_GET['color']))
            echo 'checked'; ?>>화이트</label>
          <label><input type="checkbox" name="color[]" value="실버" <?php if (isset($_GET['color']) && in_array('실버', $_GET['color']))
            echo 'checked'; ?>>실버</label>
          <label><input type="checkbox" name="color[]" value="그 외" <?php if (isset($_GET['color']) && in_array('그 외', $_GET['color']))
            echo 'checked'; ?>>그 외</label>
        </div>
      </div>

      <div class="accordion">에너지 소비효율 등급</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="energy_rating[]" value="1" <?php if (isset($_GET['energy_rating']) && in_array('1', $_GET['energy_rating']))
            echo 'checked'; ?>>1등급</label>
          <label><input type="checkbox" name="energy_rating[]" value="2" <?php if (isset($_GET['energy_rating']) && in_array('2', $_GET['energy_rating']))
            echo 'checked'; ?>>2등급</label>
          <label><input type="checkbox" name="energy_rating[]" value="3" <?php if (isset($_GET['energy_rating']) && in_array('3', $_GET['energy_rating']))
            echo 'checked'; ?>>3등급</label>
          <label><input type="checkbox" name="energy_rating[]" value="그 외" <?php if (isset($_GET['energy_rating']) && in_array('그 외', $_GET['energy_rating']))
            echo 'checked'; ?>>그 외</label>
        </div>
      </div>

      <div class="accordion">출시 연도</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="release_year[]" value="2024" <?php if (isset($_GET['release_year']) && in_array('2024', $_GET['release_year']))
            echo 'checked'; ?>>2024년</label>
          <label><input type="checkbox" name="release_year[]" value="2023" <?php if (isset($_GET['release_year']) && in_array('2023', $_GET['release_year']))
            echo 'checked'; ?>>2023년</label>
          <label><input type="checkbox" name="release_year[]" value="2022" <?php if (isset($_GET['release_year']) && in_array('2022', $_GET['release_year']))
            echo 'checked'; ?>>2022년</label>
          <label><input type="checkbox" name="release_year[]" value="2021" <?php if (isset($_GET['release_year']) && in_array('2021', $_GET['release_year']))
            echo 'checked'; ?>>2021년</label>
          <label><input type="checkbox" name="release_year[]" value="그 이전" <?php if (isset($_GET['release_year']) && in_array('그 이전', $_GET['release_year']))
            echo 'checked'; ?>>그 이전</label>
        </div>
      </div>
      <button type="submit" class="mt-6 bg-blue-500 text-white px-2 py-1 rounded-md shadow-sm">필터 적용</button>
      <button type="reset" class="mt-6 bg-blue-500 text-white px-2 py-1 rounded-md shadow-sm"
        onclick="location.href='air_test.php'">초기화</button>
    </form>
  </div>

  <div class="content-panel">
    <div class="model-container" id="model-container">
      <div class="data-container">
        <?php
        $config = require '../../../config.php';
        $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
        $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');


        if (!$conn) {
          $e = oci_error();
          echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
          exit;
        }

        // 연 구독료 슬라이더 범위 설정
        $rangeQuery = "SELECT MIN(YEARLY_FEE) AS MIN_FEE , MAX(YEARLY_FEE) AS MAX_FEE FROM MODEL WHERE MODEL_TYPE ='공기청정기'";
        $rangeStmt = oci_parse($conn, $rangeQuery);
        oci_execute($rangeStmt);
        $range = oci_fetch_assoc($rangeStmt);
        $minFee = $range['MIN_FEE'] ?? 0;
        $maxFee = $range['MAX_FEE'] ?? 2000000;



        $query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                    mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                    NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
                  FROM MODEL_AIRCLEANER_SPEC mas
                  JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
                  LEFT JOIN SUBSCRIPTION s ON m.MODEL_ID = s.MODEL_ID
                  LEFT JOIN MODEL_RATING mr ON s.SUBSCRIPTION_ID = mr.SUBSCRIPTION_ID";

        $conditions = [];
        $params = [];


        if (!empty($_GET['filter_type'])) {
          $filter_types = $_GET['filter_type'];
          $conditions[] = "mas.FILTER_TYPE IN ('" . implode("','", array_map('htmlspecialchars', $filter_types)) . "')";
        }

        if (!empty($_GET['pm_sensor'])) {
          $pm_sensors = $_GET['pm_sensor'];
          $conditions[] = "mas.PM_SENSOR IN ('" . implode("','", array_map('htmlspecialchars', $pm_sensors)) . "')";
        }

        if (!empty($_GET['filter_grade'])) {
          $filter_grades = [];
          foreach ($_GET['filter_grade'] as $grade_range) {
            if ($grade_range == "E10-E12") {
              $filter_grades[] = "mas.FILTER_GRADE IN ('E10', 'E11', 'E12')";
            } elseif ($grade_range == "H13-H14") {
              $filter_grades[] = "mas.FILTER_GRADE IN ('H13', 'H14')";
            } elseif ($grade_range == "U15-U17") {
              $filter_grades[] = "mas.FILTER_GRADE IN ('U15', 'U16', 'U17')";
            }
          }
          if ($filter_grades) {
            $conditions[] = "(" . implode(" OR ", $filter_grades) . ")";
          }
        }

        if (!empty($_GET['coverage_area'])) {
          $coverage_areas = [];
          foreach ($_GET['coverage_area'] as $area) {
            if ($area == "over100") {
              $coverage_areas[] = "mas.COVERAGE_AREA > 100.0";
            } elseif ($area == "more71-below100") {
              $coverage_areas[] = "mas.COVERAGE_AREA >= 71.0 AND mas.COVERAGE_AREA <= 100.0";
            } elseif ($area == "more50-under71") {
              $coverage_areas[] = "mas.COVERAGE_AREA >= 50.0 AND mas.COVERAGE_AREA < 71.0";
            } elseif ($area == "under50") {
              $coverage_areas[] = "mas.COVERAGE_AREA < 50.0";
            }
          }
          if ($coverage_areas) {
            $conditions[] = "(" . implode(" OR ", $coverage_areas) . ")";
          }
        }

        // 연 구독료 필터링 조건 추가
        if (!empty($_GET['yearly_fee_min']) && !empty($_GET['yearly_fee_max'])) {
          $yearly_fee_min = isset($_GET['yearly_fee_min']) && is_numeric($_GET['yearly_fee_min']) ? (int) $_GET['yearly_fee_min'] : $minFee;
          $yearly_fee_max = isset($_GET['yearly_fee_max']) && is_numeric($_GET['yearly_fee_max']) ? (int) $_GET['yearly_fee_max'] : $maxFee;



          $conditions[] = "m.YEARLY_FEE >= {$yearly_fee_min} AND m.YEARLY_FEE <= {$yearly_fee_max}";

          $params[':minFee'] = $yearly_fee_min;
          $params[':maxFee'] = $yearly_fee_max;
        }



        if (!empty($_GET['manufacturer'])) {
          $manufacturers = $_GET['manufacturer'];

          if (in_array("그 외", $manufacturers)) {
            $selected_manufacturers = array_diff($manufacturers, ["그 외"]);

            if (count($selected_manufacturers) > 0) {
              $conditions[] = "(m.MANUFACTURER IN ('" . implode("','", array_map('htmlspecialchars', $selected_manufacturers)) . "') OR m.MANUFACTURER NOT IN ('Samsung', 'LG'))";
            } else {
              $conditions[] = "m.MANUFACTURER NOT IN ('Samsung', 'LG')";
            }
          } else {
            $conditions[] = "m.MANUFACTURER IN ('" . implode("','", array_map('htmlspecialchars', $manufacturers)) . "')";
          }
        }


        if (!empty($_GET['color'])) {
          $colors = $_GET['color'];

          if (in_array("그 외", $colors)) {
            $selected_colors = array_diff($colors, ["그 외"]);

            if (count($selected_colors) > 0) {
              $conditions[] = "(m.COLOR IN ('" . implode("','", array_map('htmlspecialchars', $selected_colors)) . "') OR m.COLOR NOT IN ('블랙', '화이트', '실버'))";
            } else {
              $conditions[] = "m.COLOR NOT IN ('블랙', '화이트', '실버')";
            }
          } else {
            $conditions[] = "m.COLOR IN ('" . implode("','", array_map('htmlspecialchars', $colors)) . "')";
          }
        }


        if (!empty($_GET['energy_rating'])) {
          $energy_ratings = $_GET['energy_rating'];

          if (in_array("그 외", $energy_ratings)) {
            $selected_ratings = array_diff($energy_ratings, ["그 외"]);

            if (count($selected_ratings) > 0) {
              $conditions[] = "(m.ENERGY_RATING IN (" . implode(",", array_map('intval', $selected_ratings)) . ") OR m.ENERGY_RATING NOT IN (1, 2, 3))";
            } else {
              $conditions[] = "m.ENERGY_RATING NOT IN (1, 2, 3)";
            }
          } else {
            $conditions[] = "m.ENERGY_RATING IN (" . implode(",", array_map('intval', $energy_ratings)) . ")";
          }
        }


        if (!empty($_GET['release_year'])) {
          $release_years = $_GET['release_year'];

          if (in_array("그 이전", $release_years)) {
            $selected_years = array_diff($release_years, ["그 이전"]);

            if (count($selected_years) > 0) {
              $conditions[] = "(m.RELEASE_YEAR IN ('" . implode("','", array_map('htmlspecialchars', $selected_years)) . "') OR m.RELEASE_YEAR < 2021)";
            } else {
              $conditions[] = "m.RELEASE_YEAR < 2021";
            }
          } else {
            $conditions[] = "m.RELEASE_YEAR IN ('" . implode("','", array_map('htmlspecialchars', $release_years)) . "')";
          }
        }




        if ($conditions) {
          $query .= " WHERE " . implode(" AND ", $conditions);
        }


        $query .= " GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                    mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
                    ORDER BY mas.MODEL_ID ASC";

        $stmt = oci_parse($conn, $query);

        foreach ($params as $key => $value) {
          oci_bind_by_name($stmt, $key, $value);
        }

        oci_execute($stmt);


        while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
          $avgRating = number_format($row['AVG_RATING'], 1);
          $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

          echo "<div class='model-card bg-white p-8 rounded-lg shadow-lg'>";
          echo "<div class='flex justify-between items-center mb-4'>";
          echo "<h2 class='text-xl font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . "</h2>";
          echo "<span class='text-md'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span>";
          echo "</div>";
          echo "<div class='flex items-center mb-4'>";
          echo "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</span>";
          echo "<div class='flex items-center ml-4'>";
          echo "<svg class='w-5 h-5 text-yellow-400' fill='#FFD700' stroke='#FFD700' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>";
          echo "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.455a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.37-2.455a1 1 0 00-1.175 0l-3.37 2.455c-.784.57-1.838-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.98 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z'></path>";
          echo "</svg>";
          echo "<span class='ml-1 text-sm text-gray-500'>" . $avgRating . " (" . number_format($row['RATING_COUNT']) . ")</span>";
          echo "<button class='review-button ml-2 text-sm text-green-600 border border-green-600 rounded px-2 py-1' data-model-id='" . htmlspecialchars($row['MODEL_ID']) . "'>리뷰 보기</button>";


          echo "</div>";
          echo "</div>";
          $imagePath = TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($row['MODEL_ID']) . ".jpg";
          echo "<img src='" . $imagePath . "' alt='Product Image' class='w-full h-48 object-cover mb-4'>";
          echo "<ul class='model-details text-gray-700 mb-4'>";
          echo "<li>필터 종류: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['FILTER_TYPE']) . "</span> · PM센서: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['PM_SENSOR']) . "</span></li>";
          echo "<li>필터 등급: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['FILTER_GRADE']) . "</span> · 공기청정 면적: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['COVERAGE_AREA']) . "m²</span></li>";
          echo "<li>에너지 등급: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['ENERGY_RATING']) . "등급</span> · 색상: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['COLOR']) . "</span></li>";
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

  <script src="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js"></script>
  <script>


    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }

    var minFee = parseInt(<?= json_encode($minFee) ?>, 10);
    var maxFee = parseInt(<?= json_encode($maxFee) ?>, 10);
    var startMin = <?= json_encode($yearly_fee_min ?? $minFee) ?>;
    var startMax = <?= json_encode($yearly_fee_max ?? $maxFee) ?>;



    var subscriptionSlider = document.getElementById('subscription-slider');


    noUiSlider.create(subscriptionSlider, {
      start: [startMin, startMax],
      connect: true,
      step: 1000,
      range: { 'min': minFee, 'max': maxFee }
    });

    subscriptionSlider.noUiSlider.on('update', function (values) {
      const minValue = parseInt(values[0]).toLocaleString();
      const maxValue = parseInt(values[1]).toLocaleString();
      document.getElementById('subscription-value').textContent = `${minValue}원 - ${maxValue}원`;

      document.getElementById('yearly_fee_min').value = parseInt(values[0]);
      document.getElementById('yearly_fee_max').value = parseInt(values[1]);
    });

    const reviewModal = document.getElementById("review-modal");
    const closeModal = document.getElementById("close-modal");
    const modalContent = document.getElementById("review-modal-content");

    // 리뷰 정렬 기능 이벤트 리스너 연결
    function attachSortEventListener(modelId) {
      const sortElement = document.getElementById("sort");
      if (sortElement) {
        sortElement.addEventListener("change", function () {
          const sortOption = this.value;

          // 리뷰 데이터를 다시 로드
          fetch(`load_reviews.php?model_id=${modelId}&sort=${sortOption}`)
            .then((response) => response.text())
            .then((data) => {
              modalContent.innerHTML = data;

              // 새로 로드된 콘텐츠에 다시 이벤트 리스너를 연결
              attachSortEventListener(modelId);
            })
            .catch((error) => {
              console.error("리뷰 데이터를 불러오는 데 실패했습니다:", error);
            });
        });
      } else {
        console.error("ID가 'sort'인 요소를 찾을 수 없습니다.");
      }
    }
    // 리뷰 모달 열기
    document.querySelectorAll(".review-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const modelId = e.target.dataset.modelId;

        modalContent.innerHTML = "<p class='text-center text-gray-500'>리뷰를 불러오는 중...</p>";

        try {
          const response = await fetch(`load_reviews.php?model_id=${modelId}`);
          const data = await response.text();
          modalContent.innerHTML = data;

          // 정렬 기능 이벤트 리스너 연결
          attachSortEventListener(modelId);
        } catch (error) {
          modalContent.innerHTML = "<p class='text-red-500'>리뷰 데이터를 불러오는 데 실패했습니다.</p>";
        }

        reviewModal.classList.add("show");
      });
    });

    // 모달 닫기
    closeModal.addEventListener("click", () => {
      reviewModal.classList.remove("show");
    });

    window.addEventListener("click", (e) => {
      if (e.target === reviewModal) {
        reviewModal.classList.remove("show");
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      const sortElement = document.getElementById("sort");
      if (sortElement) {
        sortElement.addEventListener("change", function () {
          const sortOption = this.value;
          const modelId = document.querySelector(".review-button")?.dataset.modelId;

          if (!modelId) {
            console.error("Model ID가 설정되지 않았습니다.");
            return;
          }

          fetch(`load_reviews.php?model_id=${modelId}&sort=${sortOption}`)
            .then((response) => response.text())
            .then((data) => {
              document.getElementById("review-modal-content").innerHTML = data;
            })
            .catch((error) => {
              console.error("리뷰 데이터를 불러오는 데 실패했습니다:", error);
            });
        });
      } else {
        console.error("ID가 'sort'인 요소를 찾을 수 없습니다.");
      }
    });

  </script>
  <?php
  include BASE_PATH . '/includes/customer_footer.php';
  ?>