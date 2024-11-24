<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Full Filter Panel with Custom Styles</title>
  <link href="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.css" rel="stylesheet">
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
      width: 15%;
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
      /* 아코디언 배경색 */
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
  </style>

</head>


<body>

  <?php require '../../../config.php';
  include BASE_PATH . '/includes/header.php'; ?>
  <h1>공기 청정기</h1>
  <div class="main-container">
    <div class="filter-panel">
      <!-- 필터 종류 -->
      <div class="accordion">필터 종류</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="flat">판형</label>
          <label><input type="checkbox" value="cylindrical">원통형</label>
        </div>
      </div>

      <!-- PM 센서 -->
      <div class="accordion">PM 센서</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="PM10">PM10</label>
          <label><input type="checkbox" value="PM2.5">PM 2.5</label>
          <label><input type="checkbox" value="PM1">PM 1</label>
        </div>
      </div>

      <!-- 필터 등급 -->
      <div class="accordion">필터 등급</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="E">E(10~12)</label>
          <label><input type="checkbox" value="H">H(13~14)</label>
          <label><input type="checkbox" value="U">U(15~17)</label>
        </div>
      </div>

      <!-- 공기청정 면적 -->
      <div class="accordion">공기청정 면적</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="above100">100m² 이상</label>
          <label><input type="checkbox" value="88-99">88 ~ 99m²</label>
          <label><input type="checkbox" value="51-82">51 ~ 82m²</label>
          <label><input type="checkbox" value="below50">50m² 이하</label>
        </div>
      </div>

      <div class="accordion">제조사</div>
      <div class="panel" >
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

      <div style="padding: 10px;">
        <label for="subscription-slider">연 구독료</label>
        <div id="subscription-slider" class="slider"></div>
        <span id="subscription-value" class="slider-value"></span>
      </div>
    </div>

    <div class="content-panel">
      <p>여기에 필터링된 모델이 나옴</p>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js"></script>
  <script>
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }

    var subscriptionSlider = document.getElementById('subscription-slider');
    noUiSlider.create(subscriptionSlider, {
      start: [18900, 53900],
      connect: true,
      range: {
        'min': 10000,
        'max': 100000
      }
    });
    subscriptionSlider.noUiSlider.on('update', function(values, handle) {
      document.getElementById('subscription-value').textContent = `${parseInt(values[0])}원 - ${parseInt(values[1])}원`;
    });
  </script>

  <?php
  include BASE_PATH . '/includes/footer.php';
  ?>
</body>

</html>