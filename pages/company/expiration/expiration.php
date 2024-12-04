<?php
require '../../../config.php';
include BASE_PATH . '/includes/company_header.php';
?>
<style>
    /* 데이터 컨테이너 스타일 */
    .data-container {
        display: block;
        width: 100%;
        height: 100vh;
        overflow-y: auto;
        margin-top: 60px;
    }

    /* 각 섹션 스타일 */
    .section {
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 20px;
        overflow-y: auto;
    }

    /* 테이블 스타일 */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    table,
    th,
    td {
        border: 1px solid #ddd;
    }

    th {
        background-color: #d1d5db;
        color: #4b5563;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    th,
    td {
        padding: 8px;
        text-align: left;
    }

    /* 테이블 내부 스크롤을 위한 컨테이너 */
    .table-container {
        max-height: 50vh;
        overflow-y: auto;
    }

    /* 제목 스타일 */
    h2 {
        color: #007bff;
        font-size: 1.5em;
        margin-bottom: 10px;
    }

    /* 오류 메시지 스타일 */
    .error {
        color: red;
        font-weight: bold;
    }

    /* 모달 스타일 */
    .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.4);
        background-color: rgba(0, 0, 0, 0.4);
        background-color: rgba(0, 0, 0, 0.4);
    }

    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-height: 90vh;
        overflow-y: auto;
    }

    /* 닫기 버튼 스타일 */
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }

    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }

    .btn-detail {
        color: #3b82f6;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
        font-weight: 700;
        font-size: 16px;
    }

    .btn-detail:hover {
        color: #2563eb;
    }

    .modal-content form {
        display: flex;
        flex-direction: row;
        gap: 15px;
        width: 100%;
        flex-wrap: wrap;
        justify-content: space-around;
    }

    .modal-content form br {
        display: none;
    }

    .modal-content form label {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 14px;
        display: block;
    }

    .modal-content form input,
    .modal-content form textarea,
    .modal-content form select {
        width: 100%;
        padding: 8px;
        margin-bottom: 15px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: vertical;
    }

    .modal-content form input,
    .modal-content form textarea {

        width: 30vw;
        max-width: 1200px;
        padding: 12px;
        margin-bottom: 20px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        resize: vertical;
        font-size: 16px;

    }

    .modal-content form button {
        padding: 10px 20px;
        width: 100%;
        background-color: #007bff;
        color: white;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        align-self: flex-start;
    }


    .modal-content form button:hover {
        background-color: #0056b3;
    }
</style>

<div class="data-container">
    <?php
    // 데이터베이스 연결
    $config = require '../../../config.php';
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

    if (!$conn) {
        $e = oci_error();
        echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
        exit;
    }

    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'company') {
        echo "<script>alert('회사 전용 페이지 입니다. 회사 로그인을 해주세요.');</script>";
        echo "<script>location.href='" . TEAM_PATH . "/pages/login/company_login.php';</script>";
        exit;
    }

    // A 쿼리 실행
    $queryA = "SELECT
    SUBSCRIPTION.SUBSCRIPTION_ID,    
    TO_CHAR(SUBSCRIPTION.EXPIRED_DATE, 'YY.MM.DD HH24:MI') AS EXPIRED_DATE,    
    CUSTOMER.CUSTOMER_ID,
    CUSTOMER_NAME,
    MAIN_PHONE_NUMBER,
    SUB_PHONE_NUMBER
FROM
    SUBSCRIPTION
JOIN CUSTOMER ON SUBSCRIPTION.CUSTOMER_ID = CUSTOMER.CUSTOMER_ID
LEFT JOIN REQUEST ON SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID
    AND REQUEST.REQUEST_TYPE = '회수'
WHERE
    SUBSCRIPTION.EXPIRED_DATE < SYSDATE
    AND REQUEST.SUBSCRIPTION_ID IS NULL
ORDER BY
    EXPIRED_DATE ASC
";

    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);


    // A 쿼리 결과를 테이블로 출력
    echo "<div class='section'>
            <h2>만료 관리</h2>
            <div class='table-container'>
                <table class='styled-table'>
                <thead>
                    <tr>
                        <th>구독 ID</th>
                        <th>만료 일수</th>                    
                        <th>구독 만료일</th>            
                         <th>고객 ID</th>                             
                        <th>고객 이름</th>
                        <th>고객 전화번호</th>
                         <th>보조 전화번호</th>            
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowA = oci_fetch_assoc($stmtA)) {
        echo "<tr class='request-row' data-id='" . htmlspecialchars($rowA['SUBSCRIPTION_ID']) . "' data-customer-id='" . htmlspecialchars($rowA['CUSTOMER_ID']) . "'>";
        echo "<td>" . htmlspecialchars($rowA['SUBSCRIPTION_ID']) . "</td>";
        $expiredDate = DateTime::createFromFormat('y.m.d H:i', $rowA['EXPIRED_DATE']);
        $currentDate = new DateTime();  // 현재 시간
        $interval = $currentDate->diff($expiredDate);
        echo "<td>" . $interval->days . "일 지남</td>";
        echo "<td>" . htmlspecialchars($rowA['EXPIRED_DATE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['CUSTOMER_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['CUSTOMER_NAME']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['MAIN_PHONE_NUMBER']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['SUB_PHONE_NUMBER']) . "</td>";
        echo "<td><button type='button' class='btn-detail extend-btn'>연장</button></td>";
        echo "<td><button type='button' class='btn-detail return-btn'>회수</button></td>";
        echo "</tr>";
    }

    echo "</tbody>
    </table>
</div>
</div>";

    // 리소스 해제
    oci_free_statement($stmtA);
    oci_close($conn);
    ?>
</div>

<!-- 연장 모달 -->
<div id="extendModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>구독 연장</h2>
        <p id="extendModalContent"></p>
    </div>
</div>

<!-- 회수 모달 -->
<div id="returnModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>회수 요청</h2>
        <p id="returnModalContent"></p>
    </div>
</div>

<script>
    // 연장 버튼 클릭 시 모달 열기
    const extendButtons = document.querySelectorAll('.extend-btn');
    const extendModal = document.getElementById('extendModal');
    const extendModalContent = document.getElementById('extendModalContent');

    // 회수 버튼 클릭 시 모달 열기
    const returnButtons = document.querySelectorAll('.return-btn');
    const returnModal = document.getElementById('returnModal');
    const returnModalContent = document.getElementById('returnModalContent');

    // 모달 닫기
    const closeBtns = document.querySelectorAll('.close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            extendModal.style.display = 'none';
            returnModal.style.display = 'none';
        });
    });

    // 연장 버튼 클릭 시
    // 연장 버튼 클릭 시
    extendButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('.request-row'); // 클릭한 버튼의 부모 tr
            const subscriptionId = row.getAttribute('data-id');
            const customerId = row.getAttribute('data-customer-id'); // 여기에서 customer_id를 가져옵니다.

            // AJAX 요청을 통해 연장에 대한 세부 정보를 가져옵니다.
            fetch('fetch_extend_detail.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `subscriptionId=${subscriptionId}&customerId=${customerId}` // customerId를 함께 전송
                })
                .then(response => response.text())
                .then(data => {
                    extendModalContent.innerHTML = data;
                    extendModal.style.display = 'block';
                })
                .catch(error => console.error('Error:', error));
        });
    });

    // 회수 버튼 클릭 시
    returnButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('.request-row'); // 클릭한 버튼의 부모 tr
            const subscriptionId = row.getAttribute('data-id');
            const customerId = row.getAttribute('data-customer-id'); // 여기에서 customer_id를 가져옵니다.

            // AJAX 요청을 통해 회수에 대한 세부 정보를 가져옵니다.
            fetch('fetch_return_detail.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `subscriptionId=${subscriptionId}&customerId=${customerId}`
                })
                .then(response => response.text())
                .then(data => {
                    returnModalContent.innerHTML = data;
                    returnModal.style.display = 'block';
                })
                .catch(error => console.error('Error:', error));
        });
    });


    // 모달 밖을 클릭하면 모달 닫기
    window.addEventListener('click', (event) => {
        if (event.target === extendModal || event.target === returnModal) {
            extendModal.style.display = 'none';
            returnModal.style.display = 'none';
        }
    });
</script>

<?php
include BASE_PATH . '/includes/footer.php';
?>