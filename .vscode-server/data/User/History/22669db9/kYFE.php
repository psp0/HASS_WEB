<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>tv</title>
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

    .noUi-handle {
      background-color: blue;
      border: none;
      width: 14px;
      height: 14px;
      top: -4px;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: none;
    }
  </style>

</head>

<body>

  <?php require '../../../config.php';
  include BASE_PATH . '/includes/customer_header.php'; ?>
  <h1>TV</h1>
  <div class="main-container">
    <div class="filter-panel">
      <div class="accordion active">화면 크기</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="75inch-plus">75인치 이상</label>
          <label><input type="checkbox" value="65-75inch">65 - 75 인치</label>
          <label><input type="checkbox" value="55-65inch">55 - 65 인치</label>
          <label><input type="checkbox" value="43-55inch">43 - 55 인치</label>
          <label><input type="checkbox" value="43inch-less">43인치 이하</label>
        </div>
      </div>

      <div class="accordion active">설치 유형</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="wall-mount">벽걸이</label>
          <label><input type="checkbox" value="stand">스탠드형</label>
        </div>
      </div>

      <div class="accordion active">디스플레이</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="oled">OLED</label>
          <label><input type="checkbox" value="lcd">LCD</label>
        </div>
      </div>

      <div class="accordion active">해상도</div>
      <div class="panel" style="max-height: 1000px;">
        <div class="checkbox-group">
          <label><input type="checkbox" value="8k">8k</label>
          <label><input type="checkbox" value="4k">4k</label>
          <label><input type="checkbox" value="QHD">QHD</label>
          <label><input type="checkbox" value="FHD">FHD</label>
          <label><input type="checkbox" value="HD">HD</label>
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
        'max': 1000000
      },
      step: 1000 
    });

    subscriptionSlider.noUiSlider.on('update', function(values, handle) {
      document.getElementById('subscription-value').textContent = `${parseInt(values[0])}원 - ${parseInt(values[1])}원`;
    });
  </script>
