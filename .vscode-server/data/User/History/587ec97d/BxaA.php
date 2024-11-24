<?php
require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<style>
    /* 데이터 컨테이너 스타일 */
    .data-container {
        display: block; /* flex 대신 block을 사용하여 세로로 배치 */
        width: 100%;
        height: 100vh;
        overflow-y: auto;
    }

    /* 각 섹션 스타일 */
    .section {
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 20px; /* 섹션 간 여백 추가 */
        overflow-y: auto;
    }

    /* 테이블 스타일 */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    table, th, td {
        border: 1px solid #ddd;
    }

    th {
        background-color: #f2f2f2;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    th, td {
        padding: 8px;
        text-align: left;
    }

    /* 테이블 내부 스크롤을 위한 컨테이너 */
    .table-container {
        max-height: 50vh; /* 화면의 절반 크기 */
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

    // A 쿼리 실행
    $queryA = "
    SELECT 
        REQUEST.REQUEST_ID,
        (SELECT MODEL_ID 
         FROM SUBSCRIPTION 
         WHERE SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID) AS MODEL_ID,    
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
    WHERE
        REQUEST.REQUEST_STATUS IN ('대기중', '방문예정')
    ORDER BY 
        REQUEST.REQUEST_STATUS, REQUEST.DATE_CREATED DESC";
    
    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);
    
    // B 쿼리 실행
    $queryB = "
    SELECT 
        REQUEST.REQUEST_ID,
        (SELECT MODEL_ID 
         FROM SUBSCRIPTION 
         WHERE SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID) AS MODEL_ID,    
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
                        <th>모델 ID</th>
                        <th>요청 유형</th>
                        <th>요청 상태</th>
                        <th>방문 (선호) 날짜</th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowA = oci_fetch_assoc($stmtA)) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($rowA['REQUEST_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['MODEL_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['REQUEST_TYPE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['REQUEST_STATUS']) . "</td>";
        echo "<td>" . htmlspecialchars($rowA['VISIT_DATE']) . "</td>";
        echo "</tr>";
    }
    echo "</tbody></table>
          </div>
          </div>";

    // B 쿼리 결과를 테이블로 출력
    echo "<div class='section'>
            <h2>지난 요청</h2>
            <div class='table-container'>
                <table class='styled-table'>
                <thead>
                    <tr>
                        <th>요청 ID</th>
                        <th>모델 ID</th>
                        <th>요청 유형</th>
                        <th>방문 날짜</th>
                        <th>작업자 이름</th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowB = oci_fetch_assoc($stmtB)) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($rowB['REQUEST_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['MODEL_ID']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['REQUEST_TYPE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['VISIT_DATE']) . "</td>";
        echo "<td>" . htmlspecialchars($rowB['WORKER_NAME']) . "</td>";
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

<?php
    include BASE_PATH . '/includes/footer.php';
?>
