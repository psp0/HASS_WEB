<?php
require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.css" rel="stylesheet">
<link rel="stylesheet" href="./model.css">

<!-- 리뷰 모달-->
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

<!-- 구독 신청 모달 -->
<div id="subscription-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div class="modal-content">
    <h1 class="text-xl font-bold mb-4">구독 신청</h1>
    <form id="subscription-form">

      <div class="mb-4 text-left">
        <label class="block text-gray-700 mb-2">
          <span class="text-red-500">*</span> 선호 방문 일자 및 시간
        </label>
        <div class="flex items-center mb-2">
          <span class="mr-2 font-bold">1</span>
          <input type="datetime-local" id="visit-date-1" name="visit_date_1" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div class="flex items-center">
          <span class="mr-2 font-bold">2</span>
          <input type="datetime-local" id="visit-date-2" name="visit_date_2" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      <div class="mb-4 text-left">
        <label class="block text-gray-700 mb-2">
          <span class="text-red-500">*</span> 구독기간
        </label>
        <select id="subscription-period" name="subscription_period" class="w-full px-3 py-2 border rounded-lg">
          <option value="">선택</option>
          <option value="1">1년</option>
          <option value="2">2년</option>
          <option value="3">3년</option>
          <option value="4">4년</option>
        </select>
      </div>

      <div class="mb-4 text-left">
        <label class="block text-gray-700 mb-2">기타 요청사항 (최대 1000자)</label>
        <textarea id="additional-request" name="additional_request" class="w-full px-3 py-2 border rounded-lg" rows="4"
          placeholder="요청사항을 입력해주세요." maxlength="1000"></textarea>
      </div>

      <input type="hidden" id="subscription-model-id" name="model_id">
      <button type="button" id="submit-subscription" class="w-full bg-blue-500 text-white font-bold py-2 rounded-lg">
        신청
      </button>
    </form>
    <button id="close-subscription" class="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg">닫기</button>
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
      <div class="panel" style="max-height: 1000px;">
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
      <div class="panel" style="max-height: 1000px;">
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
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group" style="max-height: 1000px;">
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
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group" style="max-height: 1000px;">
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

    </form>
  </div>

  <div class="content-panel">
    <div class="flex items-center justify-between mb-4">
      <button type="button" id="reset-filters"
        class="bg-blue-500 text-white px-2 py-2 rounded-md shadow-sm">초기화</button>
      <div class="filter-tags">
        <?php
        function displayFilterTags($filterName, $filterValues, $displayNames = null)
        {
          if (!empty($filterValues)) {
            foreach ($filterValues as $value) {
              $displayValue = $value;
              if ($displayNames && isset($displayNames[$value])) {
                $displayValue = $displayNames[$value];
              }
              echo '<div class="filter-tag">';
              echo '<span>' . htmlspecialchars($displayValue) . '</span>';
              echo '<form method="GET" style="display: inline;">';
              foreach ($_GET as $key => $vals) {
                if ($key == $filterName) {
                  foreach ($vals as $val) {
                    if ($val != $value) {
                      echo '<input type="hidden" name="' . htmlspecialchars($key) . '[]" value="' . htmlspecialchars($val) . '">';
                    }
                  }
                } else {
                  if (is_array($vals)) {
                    foreach ($vals as $val) {
                      echo '<input type="hidden" name="' . htmlspecialchars($key) . '[]" value="' . htmlspecialchars($val) . '">';
                    }
                  } else {
                    echo '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($vals) . '">';
                  }
                }
              }
              echo '<button type="submit">&times;</button>';
              echo '</form>';
              echo '</div>';
            }
          }
        }

        displayFilterTags('filter_type', $_GET['filter_type'] ?? []);
        displayFilterTags('pm_sensor', $_GET['pm_sensor'] ?? []);
        displayFilterTags('filter_grade', $_GET['filter_grade'] ?? [], [
          'E10-E12' => 'E(10-12)',
          'H13-H14' => 'H(13-14)',
          'U15-U17' => 'U(15-17)'
        ]);
        displayFilterTags('coverage_area', $_GET['coverage_area'] ?? [], [
          'over100' => '100m² 초과',
          'more71-below100' => '71-100m²',
          'more50-under71' => '50-70m²',
          'under50' => '50m² 미만'
        ]);
        displayFilterTags('manufacturer', $_GET['manufacturer'] ?? []);
        displayFilterTags('color', $_GET['color'] ?? []);
        displayFilterTags('energy_rating', $_GET['energy_rating'] ?? [], [
          '1' => '1등급',
          '2' => '2등급',
          '3' => '3등급',
          '그 외' => '그 외 등급'
        ]);
        displayFilterTags('release_year', $_GET['release_year'] ?? [], [
          '2024' => '2024년',
          '2023' => '2023년',
          '2022' => '2022년',
          '2021' => '2021년',
          '그 이전' => '그 이전'
        ]);

        if (isset($_GET['yearly_fee_min']) && isset($_GET['yearly_fee_max'])) {
          $minFeeTag = number_format($_GET['yearly_fee_min']) . '원';
          $maxFeeTag = number_format($_GET['yearly_fee_max']) . '원';
          echo '<div class="filter-tag">';
          echo '<span>연 구독료: ' . $minFeeTag . ' - ' . $maxFeeTag . '</span>';
          echo '<form method="GET" style="display: inline;">';
          foreach ($_GET as $key => $val) {
            if ($key != 'yearly_fee_min' && $key != 'yearly_fee_max') {
              if (is_array($val)) {
                foreach ($val as $v) {
                  echo '<input type="hidden" name="' . htmlspecialchars($key) . '[]" value="' . htmlspecialchars($v) . '">';
                }
              } else {
                echo '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($val) . '">';
              }
            }
          }
          echo '<button type="submit">&times;</button>';
          echo '</form>';
          echo '</div>';
        }
        ?>
      </div>
    </div>


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

  
        $rangeQuery = "SELECT MIN(YEARLY_FEE) AS MIN_FEE , MAX(YEARLY_FEE) AS MAX_FEE FROM MODEL WHERE MODEL_TYPE ='공기청정기'";
        $rangeStmt = oci_parse($conn, $rangeQuery);
        oci_execute($rangeStmt);
        $range = oci_fetch_assoc($rangeStmt);
        $minFee = $range['MIN_FEE'] ?? 0;
        $maxFee = $range['MAX_FEE'] ?? 2000000;



        $stockQuery = "
        SELECT p.MODEL_ID, 
        CASE 
           WHEN COUNT(CASE WHEN p.PRODUCT_STATUS = '재고' THEN 1 END) = 0 THEN '품절'
           ELSE '재고 있음'
       END AS STOCK_STATUS
FROM PRODUCT p
JOIN MODEL m ON p.MODEL_ID = m.MODEL_ID
WHERE m.MODEL_TYPE = '공기청정기'
GROUP BY p.MODEL_ID";

        $stockStmt = oci_parse($conn, $stockQuery);
        oci_execute($stockStmt);


        $stockStatuses = [];
        while ($stockRow = oci_fetch_array($stockStmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
          $stockStatuses[$stockRow['MODEL_ID']] = $stockRow['STOCK_STATUS'];
        }
        oci_free_statement($stockStmt);


        $query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, 
                  mas.FILTER_GRADE, mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                  NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
                  FROM MODEL_AIRCLEANER_SPEC mas
                  JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
                  LEFT JOIN MODEL_RATING mr ON mas.MODEL_ID = mr.MODEL_ID";

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

        $query .= "
        GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, 
                 mas.FILTER_GRADE, mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
        ORDER BY 
          CASE 
              WHEN (SELECT COUNT(*) FROM PRODUCT p WHERE p.MODEL_ID = mas.MODEL_ID AND p.PRODUCT_STATUS = '재고') > 0 THEN 0
              ELSE 1
          END ASC, 
          NVL(AVG(mr.RATING), 0) DESC, 
          m.RELEASE_YEAR DESC, 
          mas.MODEL_ID ASC"; 
          
        

        $stmt = oci_parse($conn, $query);

        foreach ($params as $key => $value) {
          oci_bind_by_name($stmt, $key, $value);
        }

        oci_execute($stmt);


        while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
          $modelId = $row['MODEL_ID'];
          $avgRating = number_format($row['AVG_RATING'], 1);
          $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

          // 재고 상태 가져오기
          $stockStatus = $stockStatuses[$modelId] ?? null; 
        
          echo "<div class='model-card bg-white p-8 rounded-lg shadow-lg'>";
          echo "<div class='flex justify-between items-center mb-4'>";
          echo "<h2 class='text-xl font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . "</h2>";
          echo "<span class='text-md'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span>";
          echo "</div>";
          echo "<div class='flex items-center mb-4'>";
          echo "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($modelId) . "</span>";
          echo "<div class='flex items-center ml-4'>";
          echo "<svg class='w-5 h-5 text-yellow-400' fill='#FFD700' stroke='#FFD700' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>";
          echo "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.455a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.37-2.455a1 1 0 00-1.175 0l-3.37 2.455c-.784.57-1.838-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.98 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z'></path>";
          echo "</svg>";
          echo "<span class='ml-1 text-sm text-gray-500'>" . $avgRating . " (" . number_format($row['RATING_COUNT']) . ")</span>";
          echo "<button class='review-button ml-2 text-sm text-blue-600 border border-blue-600 rounded px-2 py-1' data-model-id='" . htmlspecialchars($modelId) . "'>리뷰 보기</button>";
          echo "</div>";
          echo "</div>";

          $imagePath = TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($modelId) . ".jpg?" . time();
          echo "<img src='" . $imagePath . "' alt='Product Image' class='w-full h-48 object-cover mb-4'>";

          echo "<ul class='model-details text-gray-700 mb-4'>";
          echo "<li>필터 종류: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['FILTER_TYPE']) . "</span> · PM센서: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['PM_SENSOR']) . "</span></li>";
          echo "<li>필터 등급: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['FILTER_GRADE']) . "</span> · 공기청정 면적: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['COVERAGE_AREA']) . "m²</span></li>";
          echo "<li>에너지 등급: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['ENERGY_RATING']) . "등급</span> · 색상: <span style='color: #000; font-weight: 550;'>" . htmlspecialchars($row['COLOR']) . "</span></li>";
          echo "</ul>";
          echo "<div class='text-lg font-bold mb-2'>연 " . number_format($row['YEARLY_FEE']) . " 원</div>";
          echo "<div class='text-sm text-gray-500 mb-4'>월 약 " . number_format($monthlyFee) . "원</div>";


          if ($stockStatus === '품절') {
            echo "<button class='w-full bg-gray-400 text-white font-bold py-2 rounded-lg cursor-not-allowed' disabled>품절</button>";
          } else {
            echo "<button class='w-full bg-blue-600 text-white font-bold py-2 rounded-lg subscription-button' data-model-id='$modelId'>구독 신청</button>";
          }
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
    document.addEventListener("DOMContentLoaded", () => {
      const filterForm = document.querySelector(".filter-panel form");


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
      var startMin = <?= json_encode(isset($_GET['yearly_fee_min']) ? $_GET['yearly_fee_min'] : $minFee) ?>;
      var startMax = <?= json_encode(isset($_GET['yearly_fee_max']) ? $_GET['yearly_fee_max'] : $maxFee) ?>;

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


      subscriptionSlider.noUiSlider.on('change', function () {
        filterForm.submit();
      });


      const checkboxes = filterForm.querySelectorAll("input[type='checkbox']");

      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          filterForm.submit();
        });
      });


      const resetButton = document.getElementById('reset-filters');
      resetButton.addEventListener('click', () => {
        window.location.href = 'air_cleaner.php';
      });


      const reviewModal = document.getElementById("review-modal");
      const closeModal = document.getElementById("close-modal");
      const modalContent = document.getElementById("review-modal-content");

      function attachSortEventListener(modelId) {
        const sortElement = document.getElementById("sort");
        if (sortElement) {
          sortElement.addEventListener("change", function () {
            const sortOption = this.value;
            fetch(`load_reviews.php?model_id=${modelId}&sort=${sortOption}`)
              .then((response) => response.text())
              .then((data) => {
                modalContent.innerHTML = data;
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

      document.querySelectorAll(".review-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const modelId = e.target.dataset.modelId;

          modalContent.innerHTML = "<p class='text-center text-gray-500'>리뷰를 불러오는 중...</p>";

          try {
            const response = await fetch(`load_reviews.php?model_id=${modelId}`);
            const data = await response.text();
            modalContent.innerHTML = data;
            attachSortEventListener(modelId);
          } catch (error) {
            modalContent.innerHTML = "<p class='text-red-500'>리뷰 데이터를 불러오는 데 실패했습니다.</p>";
          }


          reviewModal.classList.remove("hidden");
          reviewModal.classList.add("show");
          document.querySelector(".filter-panel").style.pointerEvents = "none";
          document.body.style.overflow = "hidden";
        });
      });

      closeModal.addEventListener("click", () => {
        reviewModal.classList.remove("show");
        reviewModal.classList.add("hidden");
        document.querySelector(".filter-panel").style.pointerEvents = "auto";
        document.body.style.overflow = "auto";
      });


      const filterPanel = document.querySelector(".filter-panel");

      function restoreScrollPosition() {
        const filterScroll = sessionStorage.getItem("filterScroll");
        if (filterScroll) {
          filterPanel.scrollTop = parseInt(filterScroll, 10);
        }

        const bodyScroll = sessionStorage.getItem("bodyScroll");
        if (bodyScroll) {
          window.scrollTo(0, parseInt(bodyScroll, 10));
        }
      }

      function saveScrollPosition() {
        sessionStorage.setItem("filterScroll", filterPanel.scrollTop);
        sessionStorage.setItem("bodyScroll", window.scrollY);
      }

      filterPanel.addEventListener("scroll", saveScrollPosition);
      window.addEventListener("scroll", saveScrollPosition);
      restoreScrollPosition();

      // 구독 신청 모달 관련 코드
      const isLoggedIn = <?= json_encode(isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true); ?>;

      const subscriptionButtons = document.querySelectorAll(".subscription-button");
      const subscriptionModal = document.getElementById("subscription-modal");
      const closeSubscription = document.getElementById("close-subscription");

      subscriptionButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            window.location.href = "<?= TEAM_PATH; ?>/pages/login/customer_login.php";
            return;
          }

         
          const modelId = e.currentTarget.dataset.modelId;
          document.getElementById("subscription-model-id").value = modelId;

         
          subscriptionModal.style.display = "flex";
          document.querySelector(".filter-panel").style.pointerEvents = "none";
          document.body.style.overflow = "hidden"; 
        });
      });

      closeSubscription.addEventListener("click", () => {
        subscriptionModal.style.display = "none";
        document.querySelector(".filter-panel").style.pointerEvents = "auto";
        document.body.style.overflow = "auto"; 
      });

      document.getElementById("submit-subscription").addEventListener("click", () => {
        const visitDate1 = document.getElementById("visit-date-1").value;
        const visitDate2 = document.getElementById("visit-date-2").value;
        const subscriptionPeriod = document.getElementById("subscription-period").value;
        const additionalRequest = document.getElementById("additional-request").value;
        const modelId = document.getElementById("subscription-model-id").value;

        if (!visitDate1 || !visitDate2 || !subscriptionPeriod) {
          alert("필수 정보를 입력해주세요.");
          return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "subscription.php", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        const data = JSON.stringify({
          visit_date_1: visitDate1,
          visit_date_2: visitDate2,
          subscription_period: subscriptionPeriod,
          additional_request: additionalRequest,
          model_id: modelId,
        });

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                alert("구독 신청이 완료되었습니다.");
                window.location.href = "<?= TEAM_PATH; ?>/pages/customer/my_info/my_info.php";
              } else {
                alert("구독 신청 실패: " + response.message);
              }
            } catch (error) {
              console.error("JSON 파싱 오류:", error);
              alert("서버 응답이 올바르지 않습니다.");
            }
          } else {
            alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          }
        };

        xhr.send(data);
      });

    });  
  </script>

  <?php
  include BASE_PATH . '/includes/customer_footer.php';
  ?>