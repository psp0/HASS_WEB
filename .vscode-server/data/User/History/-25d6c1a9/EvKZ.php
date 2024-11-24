<?php
// 회원가입 요청 처리
if (isset($_POST['action']) && $_POST['action'] == 'register_user') {
    // Oracle 데이터베이스 연결
    $db = '(DESCRIPTION =
    (ADDRESS_LIST=
    (ADDRESS = (PROTOCOL = TCP)(HOST = 203.249.87.57)(PORT = 1521))
    )
    (CONNECT_DATA = (SID = orcl)
    )
    )';
    $username = "DB502_PROJ_G2"; // 사용자명
    $password = "6969"; // 비밀번호

    // 연결
    $connect = oci_connect($username, $password, $db, 'AL32UTF8');

    if (!$connect) {
        $response = ['status' => 'error', 'message' => '데이터베이스 연결 실패'];
        echo json_encode($response);
        exit;
    }

    // 폼 데이터 가져오기
    $user_id = $_POST['student_id'];
    $name = $_POST['name'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // 비밀번호 해싱
    $gender = $_POST['gender'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $dept = $_POST['dept'];

    // 아이디 중복 확인 SQL 쿼리
    $check_sql = "SELECT COUNT(*) AS CNT FROM USER_T WHERE USER_ID = :user_id";
    $check_stid = oci_parse($connect, $check_sql);
    oci_bind_by_name($check_stid, ":user_id", $user_id);
    oci_execute($check_stid);
    $row = oci_fetch_array($check_stid, OCI_ASSOC + OCI_RETURN_NULLS);

    if ($row && $row['CNT'] > 0) {
        // 이미 존재하는 아이디
        $response = ['status' => 'error', 'message' => '이미 사용 중인 아이디입니다.'];
        oci_free_statement($check_stid);
        oci_close($connect);
        echo json_encode($response);
        exit;
    }

    // 새로운 사용자 추가 SQL 쿼리
    $insert_sql = "INSERT INTO USER_T (USER_ID, NAME, TEL, GENDER, E_MAIL, PW, DEPT)
                    VALUES (:user_id, :name, :phone, :gender, :email, :password, :dept)";

    $insert_stid = oci_parse($connect, $insert_sql);

    // 바인딩된 값들
    oci_bind_by_name($insert_stid, ":user_id", $user_id);
    oci_bind_by_name($insert_stid, ":name", $name);
    oci_bind_by_name($insert_stid, ":phone", $phone);
    oci_bind_by_name($insert_stid, ":gender", $gender);
    oci_bind_by_name($insert_stid, ":email", $email);
    oci_bind_by_name($insert_stid, ":password", $password);
    oci_bind_by_name($insert_stid, ":dept", $dept);

    // 쿼리 실행
    $execute = oci_execute($insert_stid);

    if ($execute) {
        $response = ['status' => 'success', 'message' => '회원가입이 성공적으로 완료되었습니다.'];
    } else {
        $e = oci_error($insert_stid);  // 쿼리 오류 확인
        $response = ['status' => 'error', 'message' => '회원가입 중 오류 발생: ' . htmlentities($e['message'])];
    }

    // 종료
    oci_free_statement($insert_stid);
    oci_close($connect);

    // 응답 반환
    echo json_encode($response);
    exit;
}
?>



    <script>
        // JavaScript로 폼 제출 후 서버에서 에러 메시지를 표시하는 처리
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();  // 폼 기본 제출 방지

            var formData = new FormData(this);
            formData.append('action', 'login_user');  // action 값 추가

            // AJAX 요청을 사용하여 서버에 로그인 정보 확인 요청
            fetch('login.php', {  // 로그인 처리 PHP 파일로 요청
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // 로그인 성공 시 페이지 리다이렉트
                    window.location.href = 'mainpage_login.php';  // 로그인 성공 시 mainpage로 리다이렉트
                } else {
                    // 로그인 실패 시 에러 메시지 표시
                    document.getElementById('error-message').style.display = 'block';
                    document.getElementById('error-message').textContent = data.message;  // 에러 메시지 표시
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    </script>
</body>
</html>









<body>
    
    <div class="signup-container">
        <div class="logo-container">
            <a href="login.php">
                <img src="img/logo.png" alt="로고" class = "logo-container img">
            </a>
        </div>
        <h2>회원가입</h2>
        <form id="signupForm" method="POST" action="membership.php">
            <div class="form-group">
                <input type="text" id="student_id" name="student_id" placeholder="아이디(학번)" required>
            </div>
            <div class="form-group">
                <input type="password" id="password" name="password" placeholder="비밀번호 (20자 이내)" required maxlength="20">
            </div>
            <div class="form-group">
                <input type="text" id="name" name="name" placeholder="이름" required>
            </div>
            <div class="form-group">
                <input type="text" id="phone" name="phone" placeholder="전화번호 (- 제외하고 입력)" required>
            </div>
            <div class="form-group">
                <input type="email" id="email" name="email" placeholder="이메일" required>
            </div>
            <div class="form-group">
                <input type="text" id="dept" name="dept" placeholder="학과" required>
            </div>
            <div class="gender-group">
                <label>
                    <input type="radio" name="gender" value="남" required> 남성
                </label>
                <label>
                    <input type="radio" name="gender" value="여" required> 여성
                </label>
            </div>
            <div class="button-group">
                <button type="submit" class="submit-btn">가입하기</button>
                <button type="button" class="cancel-btn" onclick="location.href='login.php';">가입취소</button>
            </div>
        </form>
    </div>

    <script>
    document.getElementById("signupForm").addEventListener("submit", function (event) {
        event.preventDefault(); // 기본 폼 제출 방지

        // 입력값 가져오기
        const studentId = document.getElementById("student_id").value.trim();
        const password = document.getElementById("password").value.trim();
        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const dept = document.getElementById("dept").value.trim();
        const gender = document.querySelector('input[name="gender"]:checked');

        // 정규식 패턴
        const idPattern = /^[A-Za-z0-9]{6,20}$/; // 학번: 영문+숫자 6~20자
        const phonePattern = /^[0-9]{10,11}$/; // 전화번호: 숫자 10~11자리
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식

        // 유효성 검사
        if (!idPattern.test(studentId)) {
            alert("아이디는 영문과 숫자로 이루어진 6~20자여야 합니다.");
            return;
        }
        if (password.length < 8 || password.length > 20) {
            alert("비밀번호는 8~20자 이내로 입력해주세요.");
            return;
        }
        if (name.length === 0) {
            alert("이름을 입력해주세요.");
            return;
        }
        if (!phonePattern.test(콜)) {
            alert("전화번호는 숫자만 입력하며 10~11자리여야 합니다.");
            return;
        }
        if (!emailPattern.test(email)) {
            alert("올바른 이메일 주소를 입력해주세요.");
            return;
        }
        if (dept.length === 0) {
            alert("학과를 입력해주세요.");
            return;
        }
        if (!gender) {
            alert("성별을 선택해주세요.");
            return;
        }

        // 서버에 데이터 전송
        const formData = new FormData(this);
        formData.append("action", "register_user");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "membership.php", true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                alert(response.message);
                if (response.status === "success") {
                    window.location.href = "login.php";
                }
            } else {
                alert("회원가입 중 오류가 발생했습니다.");
            }
        };
        xhr.send(formData); // 서버로 폼 데이터 전송
    });
</script>

</body>
</html>


$('#signupForm').submit(function(e) {
        e.preventDefault();

        $.ajax({
            type: 'POST',
            url: 'signup.php',
            data: $(this).serialize(),
            success: fuction (response) {
                alert('회원가입이 완료되었습니다.');
                window.location.href='customer_login.php';
            },
            error: function (xhr) {
                alert('회원가입 중 오류가 발생했습니다.: ' + xhr.responseText);
            }
        });
    });