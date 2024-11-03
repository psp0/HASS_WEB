<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
        }
        .signup-container {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            text-align: left; 
            width: 400px;
        }

        .signup-container input {
            width: 97%;
            padding: 3px;
            margin: 5px 0;
            font-size: 13px;
        }

        .signup-container button {
            padding: 5px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 50%;
            margin: 10px auto;
            display: block;
        }

        .signup-container button:hover {
            background-color: #45a049;
        }

        .error-message {
            color: red;
            font-size: 12px;
            margin: 3px 0;
            text-align: left; 
        }

        .address-container {
            display: flex;
            flex-direction: column;
        }

        .address-container .postal-container {
            display: flex;
            align-items: center;
        }

        .postal-container input {
            margin-bottom: 5px;
            margin-right: 5px;
            flex-grow: 1;
        }

        .search-button {
            padding: 6px 8px;
            font-size: 12px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .search-button:hover {
            background-color: #45a049;
        }

        .duplicate-check-button {
            padding: 4px;
            font-size: 12px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 10px;
        }

        .duplicate-check-button:hover {
            background-color: #1976D2;
        }

        .postal-container {
            display: flex;
            align-items: center;
        }

        .required {
            color: red;
            font-size: 14px; 
            margin-left: -5px; 
            vertical-align: super; 
        }
    </style>
    <script>
        function openPostcode() {
            new daum.Postcode({
                oncomplete: function(data) {
                    document.getElementById('postalCode').value = data.zonecode;
                    document.getElementById('roadAddress').value = data.roadAddress;
                }
            }).open();
        }

        function checkDuplicate() {
        var userID = document.querySelector('input[name="id"]').value;

        $.ajax({
            url: "/check_duplicate.php", // 서버에 중복확인 요청을 보낼 PHP 파일
            type: "POST",
            data: { id: userID },
            success: function(response) {
                if (response === "exists") {
                    alert("이미 사용 중인 ID입니다.");
                } else if (response === "available") {
                    alert("사용 가능한 ID입니다.");
                }
            }
        });
    }
    </script>
</head>

<body>
    <div class="signup-container">
        <form action="pages/login/signup.php" method="POST">
            <label for="userID">ID <span class="required">*</span></label> 
            <div class="postal-container"> 
                <input type="text" name="id">
                <button type="button" class="duplicate-check-button" onclick="checkDuplicate()">중복확인</button>
            </div>
            <label for="password">Password <span class="required">*</span></label>
            <div class="error-message">영어+숫자+특수문자(! @ # $), 8자 이상.</div>
            <input type="password" name="password" required pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}">
            <label for="name">이름 <span class="required">*</span></label>
            <input type="text" name="name" required>
            <label for="main_phone">메인 전화번호 <span class="required">*</span></label>
            <div class="error-message">010xxxxxxxx형태로 입력해주세요.</div>
            <input type="text" name="main_phone" required>
            <label for="sub_phone">예비 전화번호</label>
            <input type="text" name="sub_phone">

            <div class="address-container">
                <label for="postalCode">주소 <span class="required">*</span></label>
                <div class="postal-container">
                    <input type="text" id="postalCode" name="postal_code" required readonly>
                    <button type="button" class="search-button" onclick="openPostcode()">우편번호 검색</button>
                </div>
                <input type="text" id="roadAddress" name="road_address" required readonly>
                <input type="text" name="detail_address" placeholder="상세 주소">
            </div>

            <button type="submit">회원가입</button>
        </form>
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://ssl.daumcdn.net/dmaps/map_js_init/postcode.v2.js"></script>
</body>
</html>