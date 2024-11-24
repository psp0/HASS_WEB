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
    <div class="accordion">필터 종류</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" name="filter_type" value="flat">판형</label>
        <label><input type="checkbox" name="filter_type" value="cylindrical">원통형</label>
      </div>
    </div>
    <div class="accordion">PM 센서</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" name="pm_sensor" value="PM10">PM10</label>
        <label><input type="checkbox" name="pm_sensor" value="PM2.5">PM2.5</label>
        <label><input type="checkbox" name="pm_sensor" value="PM1">PM1</label>
      </div>
    </div>

    <div class="accordion">필터 등급</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" name="filter_grade" value="E10">E(10 - 12)</label>
        <label><input type="checkbox" name="filter_grade" value="H13">H(13 - 14)</label>
        <label><input type="checkbox" name="filter_grade" value="U15">U(15 - 17)</label>
      </div>
    </div>

    <div class="accordion">공기청정 면적</div>
    <div class="panel" style="max-height: 1000px;">
      <div class="checkbox-group">
        <label><input type="checkbox" name="coverage_area" value="above100">100m² 이상</label>
        <label><input type="checkbox" name="coverage_area" value="88-99">88 - 99m²</label>
        <label><input type="checkbox" name="coverage_area" value="51-82">51 - 82m²</label>
        <label><input type="checkbox" name="coverage_area" value="below50">50m² 이하</label>
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
        <label><input type="checkbox" name="manufacturer" value="samsung">삼성</label>
        <label><input type="checkbox" name="manufacturer" value="lg">LG</label>
        <label><input type="checkbox" name="manufacturer" value="other">그 외</label>
      </div>
    </div>

    <div class="accordion">색상</div>
    <div class="panel">
      <div class="checkbox-group">
        <label><input type="checkbox" name="color" value="black">블랙</label>
        <label><input type="checkbox" name="color" value="white">화이트</label>
        <label><input type="checkbox" name="color" value="silver">실버</label>
        <label><input type="checkbox" name="color" value="other">그외</label>
      </div>
    </div>

    <div class="accordion">에너지효율등급</div>
    <div class="panel">
      <div class="checkbox-group">
        <label><input type="checkbox" name="energy_rating" value="1">1등급</label>
        <label><input type="checkbox" name="energy_rating" value="2">2등급</label>
        <label><input type="checkbox" name="energy_rating" value="3">3등급</label>
        <label><input type="checkbox" name="energy_rating" value="4">4등급</label>
        <label><input type="checkbox" name="energy_rating" value="5">5등급</label>
      </div>
    </div>

    <div class="accordion">출시 연도</div>
    <div class="panel">
      <div class="checkbox-group">
        <label><input type="checkbox" name="release_year" value="2024">2024년</label>
        <label><input type="checkbox" name="release_year" value="2023">2023년</label>
        <label><input type="checkbox" name="release_year" value="2022">2022년</label>
        <label><input type="checkbox" name="release_year" value="2021">2021년</label>
        <label><input type="checkbox" name="release_year" value="before2020">그 이전</label>
      </div>
    </div>
  </div>

  <div class="content-panel">
    <div class="model-container" id="model-container">
      <div class="data-container"></div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js"></script>
<script>
  // 필터링 적용 함수
  function applyFilters() {
    const params = new URLSearchParams();

    document.querySelectorAll('input[name="filter_type"]:checked').forEach(checkbox => params.append("filterType[]", checkbox.value));
    document.querySelectorAll('input[name="pm_sensor"]:checked').forEach(checkbox => params.append("pmSensor[]", checkbox.value));
    document.querySelectorAll('input[name="filter_grade"]:checked').forEach(checkbox => params.append("filterGrade[]", checkbox.value));
    document.querySelectorAll('input[name="coverage_area"]:checked').forEach(checkbox => params.append("coverageArea[]", checkbox.value));

    const [minFee, maxFee] = subscriptionSlider.noUiSlider.get();
    params.append("minYearlyFee", minFee);
    params.append("maxYearlyFee", maxFee);

    document.querySelectorAll('input[name="manufacturer"]:checked').forEach(checkbox => params.append("manufacturer[]", checkbox.value));
    document.querySelectorAll('input[name="color"]:checked').forEach(checkbox => params.append("color[]", checkbox.value));
    document.querySelectorAll('input[name="energy_rating"]:checked').forEach(checkbox => params.append("energyRating[]", checkbox.value));
    document.querySelectorAll('input[name="release_year"]:checked').forEach(checkbox => params.append("releaseYear[]", checkbox.value));

    fetch("your_php_script.php?" + params.toString())
      .then(response => response.json())
      .then(data => {
        document.querySelector(".data-container").innerHTML = data.html;
      });
  }

  // 이벤트 리스너 추가
  document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  var subscriptionSlider = document.getElementById('subscription-slider');
  noUiSlider.create(subscriptionSlider, {
    start: [0, 2000000],
    connect: true,
    step: 1000,
    range: { 'min': 0, 'max': 2000000 }
  });

  subscriptionSlider.noUiSlider.on('change', applyFilters);
</script>

<?php include BASE_PATH . '/includes/customer_footer.php'; ?>
