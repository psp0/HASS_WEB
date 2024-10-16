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
  <h1>세탁기</h1>
  <div class="main-container">
    <div class="filter-panel">
      <!-- 각 필터의 상세 설정 -->

      <div class="accordion active">세탁기 종류</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="drum">드럼</label>
          <label><input type="checkbox" value="top-load">통돌이</label>
          <label><input type="checkbox" value="mini">미니</label>
        </div>
      </div>

      <div class="accordion active">세탁용량</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="25kg">25kg 이상</label>
          <label><input type="checkbox" value="21kg">21kg - 24kg</label>
          <label><input type="checkbox" value="15kg">15kg - 20kg</label>
          <label><input type="checkbox" value="10kg">10kg - 14kg</label>
          <label><input type="checkbox" value="9kg">9kg 이하</label>
        </div>
      </div>

      <div class="accordion">제조사</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" value="samsung">삼성</label>
          <label><input type="checkbox" value="lg">LG</label>
          <label><input type="checkbox" value="beko">그 외</label>
        </div>
      </div>

      <div class="accordion">색상</div>
      <div class="panel">
        <div class="checkbox-group">
          <label><input type="checkbox" value="black">블랙</label>
          <label><input type="checkbox" value="white">화이트</label>
          <label><input type="checkbox" value="silver">실버</label>
          <label><input type="checkbox" value="other">그 외</label>
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