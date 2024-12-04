<?php
require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<style>
    .data-container {
        display: block;
        width: 100%;
        height: 90vh;
        overflow-y: auto;
    }

    #modal-content form {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    #modal-content form label,
    #modal-content form select,
    #modal-content form button {
        width: 100%;
        margin-bottom: 15px;
    }

    #modal-content form br {
        display: none;
    }

    #modal-content form label {
        font-weight: bold;
        margin-bottom: 5px;
        margin-top: 7px;
        font-size: 14px;
    }

    #modal-content form select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    #modal-content form button {
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }

    #modal-content form button:hover {
        background-color: #0056b3;
    }

    .section {
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 20px;
        overflow-y: auto;
    }

    table {
        width: 100%;
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
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
        padding: 0.5rem 1rem;
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
    }

    .table-container {
        max-height: 28vh;
        overflow-y: auto;
    }

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

    table .request-row {
        transition: background-color 0.3s ease, transform 0.2s ease;
    }

    table .request-row:hover {
        background-color: #f0f0f0;
        cursor: pointer;
        transform: scale(0.98);
    }

    .btn-detail {
        color: #3b82f6;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
        font-weight: 700;
    }

    .btn-detail:hover {
        color: #2563eb;
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

    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'worker') {
        echo "<script>alert('기사 전용 페이지 입니다. 기사 로그인을 해주세요.');</script>";
        echo "<script>location.href='" . TEAM_PATH . "/pages/login/worker_login.php';</script>";
        exit;
    }

    // A 쿼리 실행
    $queryA = "SELECT 
    REQUEST.REQUEST_ID,
    REQUEST.SUBSCRIPTION_ID,
    MODEL.MODEL_TYPE,
    REQUEST.REQUEST_TYPE,
    REQUEST.REQUEST_STATUS,
    CASE 
        WHEN (SELECT VISIT_DATE 
              FROM VISIT 
              WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID) IS NULL 
        THEN (SELECT LISTAGG(TO_CHAR(PREFER_DATE, 'YY.MM.DD HH24:MI'), ', ') 
              WITHIN GROUP (ORDER BY PREFER_DATE) 
              FROM REQUEST_PREFERENCE_DATE 
              WHERE REQUEST.REQUEST_ID = REQUEST_PREFERENCE_DATE.REQUEST_ID)
        ELSE TO_CHAR((SELECT VISIT_DATE 
                      FROM VISIT 
                      WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID), 'YY.MM.DD HH24:MI')
    END AS VISIT_DATE
FROM
    REQUEST
JOIN 
    SUBSCRIPTION ON REQUEST.SUBSCRIPTION_ID = SUBSCRIPTION.SUBSCRIPTION_ID
JOIN 
    PRODUCT ON SUBSCRIPTION.SERIAL_NUMBER = PRODUCT.SERIAL_NUMBER
JOIN 
    MODEL ON PRODUCT.MODEL_ID = MODEL.MODEL_ID
WHERE
    REQUEST.REQUEST_STATUS IN ('대기중', '방문예정')
ORDER BY 
    REQUEST.REQUEST_STATUS, REQUEST.DATE_CREATED DESC
";

    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);

    // B 쿼리 실행
    $queryB = "SELECT 
        REQUEST.REQUEST_ID,
        REQUEST.SUBSCRIPTION_ID,
        REQUEST.REQUEST_TYPE,
        TO_CHAR((SELECT VISIT_DATE 
                 FROM VISIT 
                 WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID), 'YY.MM.DD HH24:MI') AS VISIT_DATE,
        (SELECT WORKER_NAME 
         FROM WORKER 
         WHERE WORKER.WORKER_ID = (SELECT WORKER_ID 
                                   FROM VISIT 
                                   WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID)) AS WORKER_NAME
    FROM
        REQUEST 
    WHERE
        REQUEST.REQUEST_STATUS = '방문완료'
    ORDER BY 
        (SELECT VISIT_DATE 
         FROM VISIT 
         WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID) DESC";

    $stmtB = oci_parse($conn, $queryB);
    oci_execute($stmtB);

    // A 쿼리 결과를 테이블로 출력
    echo "<div class='section'>
            <h2>요청 관리</h2>
            <div class='table-container'>
                <table class='styled-table'>
                <thead>
                    <tr>
                        <th>요청 ID</th>
                        <th>구독 ID</th>
                        <th>종류</th>
                        <th>요청 유형</th>
                        <th>요청 상태</th>
                        <th>방문 (선호) 일자</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowA = oci_fetch_assoc($stmtA)) {
        echo "<tr class='request-row' data-id='" . htmlspecialchars($rowA['REQUEST_ID']) . "'>";
        echo "<td>" . htmlspecialchars($rowA['REQUEST_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['SUBSCRIPTION_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['MODEL_TYPE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['REQUEST_TYPE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['REQUEST_STATUS']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['VISIT_DATE']) . "</td>";
        echo "<td><button class='btn-detail' type=\"button\">자세히</button></td>";
        echo "</tr>";
    }
    echo "</tbody></table>
          </div>
          </div>";

    // B 쿼리 결과를 테이블로 출력
    echo "<div class='section'>
            <h2>방문 완료된 요청</h2>
            <div class='table-container'>
                <table class='styled-table'>
                <thead>
                    <tr>
                        <th>요청 ID</th>
                        <th>구독 ID</th>
                        <th>요청 유형</th>
                        <th>방문 일자</th>
                        <th>기사 이름</th>
                       <th></th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowB = oci_fetch_assoc($stmtB)) {
        echo "<tr class='request-row' data-id='" . htmlspecialchars($rowB['REQUEST_ID']) . "'>";
        echo "<td>" . htmlspecialchars($rowB['REQUEST_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['SUBSCRIPTION_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['REQUEST_TYPE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['VISIT_DATE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['WORKER_NAME']) . "</td>";
        echo "<td><button class='btn-detail' type=\"button\">자세히</button></td>";
        echo "</tr>";
    }
    echo "</tbody></table>
          </div>
          </div>";

    // 리소스 해제
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_close($conn);
    ?>
</div>

<!-- 모달 HTML -->
<div id="myModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>요청 상세 정보</h2>
        <p id="modal-content"></p>
    </div>
</div>

<script>
    // 모든 행을 선택합니다.
    const rows = document.querySelectorAll('.request-row');
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.querySelector('.close'); // 닫기 버튼

    // 각 행에 클릭 이벤트 리스너 추가
    rows.forEach(row => {
        row.addEventListener('click', function() {
            const requestId = this.getAttribute('data-id');

            // AJAX 요청 보내기
            fetch('fetch_request_detail.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `requestId=${requestId}`
                })
                .then(response => response.text())
                .then(data => {
                    modalContent.innerHTML = data; // PHP에서 받은 HTML을 모달에 표시
                    modal.style.display = 'block'; // 모달 표시
                })
                .catch(error => console.error('Error:', error));
        });
    });

    // 모달 닫기 버튼 클릭 시 모달 닫기
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 모달 밖을 클릭하면 모달 닫기
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
</script>

<?php
include BASE_PATH . '/includes/footer.php';
?>