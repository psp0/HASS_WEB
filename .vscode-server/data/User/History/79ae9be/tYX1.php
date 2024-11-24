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

<div class="main-container">
  <div class="filter-panel">
    <div class="accordion">필터 종류</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" value="flat">판형</label>
        <label><input type="checkbox" value="cylindrical">원통형</label>
      </div>
    </div>
    <div class="accordion">PM 센서</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" value="PM10">PM10</label>
        <label><input type="checkbox" value="PM2.5">PM 2.5</label>
        <label><input type="checkbox" value="PM1">PM 1</label>
      </div>
    </div>

    <div class="accordion">필터 등급</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" value="E">E(10~12)</label>
        <label><input type="checkbox" value="H">H(13~14)</label>
        <label><input type="checkbox" value="U">U(15~17)</label>
      </div>
    </div>

    <div class="accordion">공기청정 면적</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" value="above100">100m² 이상</label>
        <label><input type="checkbox" value="88-99">88 ~ 99m²</label>
        <label><input type="checkbox" value="51-82">51 ~ 82m²</label>
        <label><input type="checkbox" value="below50">50m² 이하</label>
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
        <label><input type="checkbox" value="samsung">삼성</label>
        <label><input type="checkbox" value="lg">LG</label>
        <label><input type="checkbox" value="ohter">그 외</label>
      </div>
    </div>

    <div class="accordion">색상</div>
    <div class="panel">
      <div class="checkbox-group">
        <label><input type="checkbox" value="black">블랙</label>
        <label><input type="checkbox" value="white">화이트</label>
        <label><input type="checkbox" value="silver">실버</label>
        <label><input type="checkbox" value="other">그외</label>
      </div>
    </div>

    <div class="accordion">에너지효율등급</div>
    <div class="panel">
      <div class="checkbox-group">
        <label><input type="checkbox" value="1">1등급</label>
        <label><input type="checkbox" value="2">2등급</label>
        <label><input type="checkbox" value="3">3등급</label>
        <label><input type="checkbox" value="4">4등급</label>
        <label><input type="checkbox" value="5">5등급</label>
      </div>
    </div>

    <div class="accordion">출시 연도</div>
    <div class="panel">
      <div class="checkbox-group">
        <label><input type="checkbox" value="2024">2024년</label>
        <label><input type="checkbox" value="2023">2023년</label>
        <label><input type="checkbox" value="2022">2022년</label>
        <label><input type="checkbox" value="2021">2021년</label>
        <label><input type="checkbox" value="before2020">그 이전</label>
      </div>
    </div>
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

        $query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                    mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                    NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
                  FROM MODEL_AIRCLEANER_SPEC mas
                  JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
                  LEFT JOIN SUBSCRIPTION s ON m.MODEL_ID = s.MODEL_ID
                  LEFT JOIN MODEL_RATING mr ON s.SUBSCRIPTION_ID = mr.SUBSCRIPTION_ID
                  GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                  mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
                  ORDER BY mas.MODEL_ID ASC";

        $stmt = oci_parse($conn, $query);
        oci_execute($stmt);

        while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
          $avgRating = number_format($row['AVG_RATING'], 1);
          $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

          echo "<div class='model-card bg-white p-8 rounded-lg shadow-lg'>";
          echo "<div class='flex justify-between items-center mb-4'>";
          echo "<h2 class='text-xl font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . "</h2>";
          echo "<span class='text-md text-gray-500'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span>";
          echo "</div>";
          echo "<div class='flex items-center mb-4'>";
          echo "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</span>";
          echo "<div class='flex items-center ml-4'>";
          echo "<svg class='w-5 h-5 text-yellow-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>";
          echo "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.455a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.37-2.455a1 1 0 00-1.175 0l-3.37 2.455c-.784.57-1.838-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.98 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z'></path>";
          echo "</svg>";
          echo "<span class='ml-1 text-sm text-gray-500'>" . $avgRating . " (" . number_format($row['RATING_COUNT']) . ")</span>";
          echo "<button class='ml-2 text-sm text-green-600 border border-green-600 rounded px-2 py-1'>리뷰 보기</button>";
          echo "</div>";
          echo "</div>";
          $imagePath = TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($row['MODEL_ID']) . ".jpg";
          echo "<img src='" . $imagePath . "' alt='Product Image' class='w-full h-48 object-cover mb-4'>";
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
  <script src="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js"></script>
  <script>

    // 클래스 이름이 "accordion"인 모든 요소를 가져옴
    var acc = document.getElementsByClassName("accordion");
    var i;

    // 모든 아코디언 요소에 클릭 이벤트 리스너를 추가
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

    // 구독 슬라이더 요소를 가져옴
    var subscriptionSlider = document.getElementById('subscription-slider');
    // noUiSlider를 초기화하고 범위와 초기 설정을 지정
    noUiSlider.create(subscriptionSlider, {
      start: [18900, 53900],
      connect: true,
      range: {
        'min': 10000,
        'max': 100000
      }
    });

    // 슬라이더 값이 업데이트될 때마다 표시되는 값을 갱신
    subscriptionSlider.noUiSlider.on('update', function (values, handle) {
      document.getElementById('subscription-value').textContent = `${parseInt(values[0])}원 - ${parseInt(values[1])}원`;
    });

    // 슬라이더 값이 설정될 때 실행되는 이벤트
    subscriptionSlider.noUiSlider.on('set', function (values) {
      var filterContainer = document.getElementById('selected-filters');
      var existingTag = document.querySelector('.filter-tag[data-type="price"]');
      var priceRange = `${parseInt(values[0])}원 - ${parseInt(values[1])}원`;
    });

  </script>
  <?php
  // 푸터 파일 불러오기
  include BASE_PATH . '/includes/customer_footer.php';
  ?>