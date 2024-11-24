<?php
// 헤더 파일 불러오기
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.css" rel="stylesheet">
<style>
  /* 스타일 */
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
    color: #888;
    font-weight: bold;
    float: right;
    margin-left: 5px;
  }

  .active:after {
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
    flex: 1 1 calc(33.333% - 15px);
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

<div class="main-container">
  <div class="filter-panel">
    <form method="GET" action="">
      <button type="submit">필터 적용</button>
      <div class="accordion">필터 종류</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="filter_type[]" value="판형">판형</label>
          <label><input type="checkbox" name="filter_type[]" value="원통형">원통형</label>
        </div>
      </div>
      <!-- PM 센서 체크박스 -->
      <div class="accordion">PM 센서</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="pm_sensor[]" value="PM10">PM10</label>
          <label><input type="checkbox" name="pm_sensor[]" value="PM2.5">PM2.5</label>
          <label><input type="checkbox" name="pm_sensor[]" value="PM1">PM1</label>
        </div>
      </div>
      <!-- 필터 등급 체크박스 -->
      <div class="accordion">필터 등급</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="filter_grade[]" value="E10-E12">E(10-12)</label>
          <label><input type="checkbox" name="filter_grade[]" value="H13-H14">H(13-14)</label>
          <label><input type="checkbox" name="filter_grade[]" value="U15-U17">U(15-17)</label>
        </div>
      </div>

      <!-- 공기청정 면적 체크박스 -->
      <div class="accordion">공기청정 면적</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" name="coverage_area[]" value="over100">100m² 초과</label>
          <label><input type="checkbox" name="coverage_area[]" value="more71-below100">71m² 이상 - 100m² 이하</label>
          <label><input type="checkbox" name="coverage_area[]" value="more50-under71">50m² 이상 - 71m² 미만</label>
          <label><input type="checkbox" name="coverage_area[]" value="under50">50m² 미만</label>
        </div>
      </div>

      <div style="padding: 10px;">
        <label for="subscription-slider">연 구독료</label>
        <div id="subscription-slider" class="slider"></div>
        <span id="subscription-value" class="slider-value"></span>
      </div>

      <div class="accordion">제조사</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="manufacturer[]" value="Samsung">Samsung</label>
          <label><input type="checkbox" name="manufacturer[]" value="LG">LG</label>
          <label><input type="checkbox" name="manufacturer[]" value="그 외">그 외</label>
        </div>
      </div>

      <div class="accordion">색상</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="color[]" value="블랙">블랙</label>
          <label><input type="checkbox" name="color[]" value="화이트">화이트</label>
          <label><input type="checkbox" name="color[]" value="실버">실버</label>
          <label><input type="checkbox" name="color[]" value="그 외">그 외</label>
        </div>
      </div>

      <div class="accordion">에너지소비 효율등급</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="energy_rating[]" value="1">1등급</label>
          <label><input type="checkbox" name="energy_rating[]" value="2">2등급</label>
          <label><input type="checkbox" name="energy_rating[]" value="3">3등급</label>
          <label><input type="checkbox" name="energy_rating[]" value="그 외">그 외</label>
        </div>
      </div>

      <div class="accordion">출시 연도</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" name="release_year[]" value="2024">2024년</label>
          <label><input type="checkbox" name="release_year[]" value="2023">2023년</label>
          <label><input type="checkbox" name="release_year[]" value="2022">2022년</label>
          <label><input type="checkbox" name="release_year[]" value="2021">2021년</label>
          <label><input type="checkbox" name="release_year[]" value="그 이전">그 이전</label>
        </div>
      </div>
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

        // 연 구독료 슬라이더 범위 구하기
        $rangeQuery = "SELECT MIN(YEARLY_FEE) AS MIN_FEE , MAX(YEARLY_FEE) AS MAX_FEE FROM MODEL WHERE MODEL_TYPE ='공기청정기'";
        $rangeStmt = oci_parse($conn, $rangeQuery);
        oci_execute($rangeStmt);
        $range = oci_fetch_assoc($rangeStmt);
        $minFee = $range['MIN_FEE'] ?? 0;
        $maxFee = $range['MAX_FEE'] ?? 2000000;

        // 기본 쿼리
        $query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                    mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                    NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
                  FROM MODEL_AIRCLEANER_SPEC mas
                  JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
                  LEFT JOIN SUBSCRIPTION s ON m.MODEL_ID = s.MODEL_ID
                  LEFT JOIN MODEL_RATING mr ON s.SUBSCRIPTION_ID = mr.SUBSCRIPTION_ID";

        $conditions = [];
        $params = [];

        // 필터 조건 추가
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


        if (!empty($_GET['yearly_fee_min']) && !empty($_GET['yearly_fee_max'])) {
          $yearly_fee_min = (int) $_GET['yearly_fee_min'];
          $yearly_fee_max = (int) $_GET['yearly_fee_max'];
          $conditions[] = "m.YEARLY_FEE BETWEEN :minFee AND :maxFee";
          $params[':minFee'] = $yearly_fee_min;
          $params[':maxFee'] = $yearly_fee_max;
        }

        if (!empty($_GET['manufacturer'])) {
          $manufacturers = $_GET['manufacturer'];

          if (in_array("그 외", $manufacturers)) {
            // '그 외'와 다른 선택된 제조사가 모두 있는 경우
            $selected_manufacturers = array_diff($manufacturers, ["그 외"]);

            if (count($selected_manufacturers) > 0) {
              // 선택된 제조사와 나머지 제조사를 모두 포함하는 조건
              $conditions[] = "(m.MANUFACTURER IN ('" . implode("','", array_map('htmlspecialchars', $selected_manufacturers)) . "') OR m.MANUFACTURER NOT IN ('Samsung', 'LG'))";
            } else {
              // '그 외'만 선택된 경우
              $conditions[] = "m.MANUFACTURER NOT IN ('Samsung', 'LG')";
            }
          } else {
            // '그 외' 없이 선택된 제조사만 필터링하는 경우
            $conditions[] = "m.MANUFACTURER IN ('" . implode("','", array_map('htmlspecialchars', $manufacturers)) . "')";
          }
        }


        // 색상 필터 추가
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

        // 에너지 효율 등급 필터 추가
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

        // 출시 연도 필터 추가
        if (!empty($_GET['release_year'])) {
          $release_years = $_GET['release_year'];

          if (in_array("그 이전", $release_years)) {
            $selected_years = array_diff($release_years, ["그 이전"]);

            if (count($selected_years) > 0) {
              // 선택된 연도와 2021년 이전을 포함하는 조건
              $conditions[] = "(m.RELEASE_YEAR IN ('" . implode("','", array_map('htmlspecialchars', $selected_years)) . "') OR m.RELEASE_YEAR < 2021)";
            } else {
              // '그 이전'만 선택된 경우
              $conditions[] = "m.RELEASE_YEAR < 2021";
            }
          } else {
            // '그 이전' 없이 선택된 출시 연도만 필터링하는 경우
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
          echo "<button class='ml-2 text-sm text-green-600 border border-green-600 rounded px-2 py-1'>리뷰 보기</button>";
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
    var subscriptionSlider = document.getElementById('subscription-slider');

    noUiSlider.create(subscriptionSlider, {
      start: [minFee, maxFee],
      connect: true,
      step: 1000,
      range: { 'min': minFee, 'max': maxFee }
    });

    subscriptionSlider.noUiSlider.on('update', function (values) {
      const minValue = parseInt(values[0]).toLocaleString();
      const maxValue = parseInt(values[1]).toLocaleString();
      document.getElementById('subscription-value').textContent = `${minValue}원 - ${maxValue}원`;

      // 슬라이더 값 전송용 hidden 필드 업데이트
      document.getElementById('yearly_fee_min').value = parseInt(values[0]);
      document.getElementById('yearly_fee_max').value = parseInt(values[1]);
    });

  </script>
  <?php
  // 푸터 파일 불러오기
  include BASE_PATH . '/includes/customer_footer.php';
  ?>