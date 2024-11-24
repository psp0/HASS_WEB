<?php
require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<style>
    /* 기본 레이아웃 */
.data-container {
    display: flex;
    width: 100%;
    height: 100vh;
}

.left-section {
    display: flex;
    flex-direction: column;
    width: 50%;
    padding: 10px;
    box-sizing: border-box;
}

.right-section {
    width: 50%;
    padding: 10px;
    box-sizing: border-box;
    border-left: 2px solid #ccc; /* 가운데 구분선 */
    overflow-y: auto;
}

.section {
    flex: 1;
    margin-bottom: 20px;
    overflow-y: auto;
}

/* 테이블 기본 스타일 */
table {
    width: 100%;
    border-collapse: collapse;
}

table, th, td {
    border: 1px solid #ddd;
}

/* 테이블 헤더 고정 */
th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0; /* 상단에 고정 */
    z-index: 1; /* 헤더가 데이터 위로 올라오도록 설정 */
}

/* 테이블 내용의 스크롤 영역 설정 */
.table-container {
    max-height: 50vh;/* 원하는 높이 설정 */
    overflow-y: auto; /* 수직 스크롤 활성화 */
}

/* 기본적으로 td와 th의 padding, 정렬을 설정 */
th, td {
    padding: 8px;
    text-align: left;
}

h3 {
    margin-top: 0;
    font-size: 1.2em;
}


</style>
<div class="data-container">
    <?php     
    $config = require '../../../config.php'; 
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

    if (!$conn) {
        $e = oci_error();
        echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
        exit;
    }

    // A 쿼리 실행
    // $queryA = "SELECT REQUEST.REQUEST_ID,
    //                   (SELECT MODEL_TYPE FROM MODEL WHERE MODEL_ID = (SELECT MODEL_ID FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID)) AS MODEL_TYPE,
    //                   REQUEST.REQUEST_TYPE,
    //                   (SELECT CUSTOMER_ID FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID) AS CUSTOMER_ID,
    //                   REQUEST.DATE_CREATED
    //            FROM REQUEST
    //            WHERE REQUEST_STATUS = '대기중'
    //            ORDER BY REQUEST.DATE_CREATED DESC";
    $queryA = "SELECT * FROM REQUEST";
    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);

    // B 쿼리 실행
    $queryB = "SELECT REQUEST.REQUEST_ID,
                      REQUEST.REQUEST_TYPE,
                      (SELECT VISIT_DATE FROM VISIT WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID) AS VISIT_DATE,
                      (SELECT STREET_ADDRESS FROM CUSTOMER_ADDRESS WHERE CUSTOMER_ADDRESS.CUSTOMER_ID = (SELECT CUSTOMER_ID FROM SUBSCRIPTION WHERE SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID)) AS STREET_ADDRESS,
                      (SELECT DETAILED_ADDRESS FROM CUSTOMER_ADDRESS WHERE CUSTOMER_ADDRESS.CUSTOMER_ID = (SELECT CUSTOMER_ID FROM SUBSCRIPTION WHERE SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID)) AS DETAILED_ADDRESS,
                      (SELECT WORKER_NAME FROM WORKER WHERE WORKER.WORKER_ID = (SELECT WORKER_ID FROM VISIT WHERE VISIT.REQUEST_ID = REQUEST.REQUEST_ID)) AS WORKER_NAME
               FROM REQUEST
               WHERE REQUEST.REQUEST_STATUS = '방문예정'
               ORDER BY (SELECT VISIT_DATE FROM VISIT WHERE REQUEST.REQUEST_ID = VISIT.REQUEST_ID) DESC";

    $stmtB = oci_parse($conn, $queryB);
    oci_execute($stmtB);

    // C 쿼리 실행
    $queryC = "SELECT M.MODEL_TYPE,
                      M.MODEL_ID,
                      COALESCE(SUM(CASE WHEN P.PRODUCT_STATUS = '재고' THEN 1 ELSE 0 END), 0) AS STOCK_COUNT,
                      COALESCE(SUM(CASE WHEN P.PRODUCT_STATUS != '재고' THEN 1 ELSE 0 END), 0) AS SUBSCRIPTION_COUNT
               FROM MODEL M
               LEFT JOIN PRODUCT P ON M.MODEL_ID = P.MODEL_ID
               GROUP BY M.MODEL_TYPE, M.MODEL_ID
               ORDER BY M.MODEL_TYPE";

    $stmtC = oci_parse($conn, $queryC);
    oci_execute($stmtC);

    ?>
    
    <div class="left-section">
        <div class="section" id="A">
            <h3>대기중인 요청</h3>
            <div class="table-container">
            <table>
                <tr>
                    <th>요청ID</th>
                    <th>가전제품 종류</th>
                    <th>요청 종류</th>
                    <th>고객ID</th>
                    <th>생성일</th>
                </tr>
                <?php while ($row = oci_fetch_assoc($stmtA)): ?>
                    <tr>
                        <td><?= htmlspecialchars($row['REQUEST_ID']) ?></td>
                        <td><?= htmlspecialchars($row['MODEL_TYPE']) ?></td>
                        <td><?= htmlspecialchars($row['REQUEST_TYPE']) ?></td>
                        <td><?= htmlspecialchars($row['CUSTOMER_ID']) ?></td>
                        <td><?= htmlspecialchars($row['DATE_CREATED']) ?></td>
                    </tr>
                <?php endwhile; ?>
            </table>
        </div>
        </div>

        <div class="section" id="B">
            <h3>방문예정</h3>
            <iv class="table-container">
            <table>
                <tr>
                    <th>요청ID</th>
                    <th>요청 종류</th>
                    <th>방문 일자</th>
                    <th>도로명 주소</th>
                    <th>세부 주소</th>
                    <th>기사 이름</th>
                </tr>
                <?php while ($row = oci_fetch_assoc($stmtB)): ?>
                    <tr>
                        <td><?= htmlspecialchars($row['REQUEST_ID']) ?></td>
                        <td><?= htmlspecialchars($row['REQUEST_TYPE']) ?></td>
                        <td><?= htmlspecialchars($row['VISIT_DATE']) ?></td>
                        <td><?= htmlspecialchars($row['STREET_ADDRESS']) ?></td>
                        <td><?= htmlspecialchars($row['DETAILED_ADDRESS']) ?></td>
                        <td><?= htmlspecialchars($row['WORKER_NAME']) ?></td>
                    </tr>
                <?php endwhile; ?>
            </table>
        </div>
    </div>

    <div class="right-section">
    <h3>재고 및 구독 현황</h3>
    <div class="table-container">
    <table>
        <tr>
            <th>제품 종류</th>
            <th>모델 ID</th>
            <th>재고량</th>
            <th>구독중</th>
        </tr>
        <?php 
        // 모델 타입을 기준으로 그룹화한 후 표시
        $previousModelType = '';  // 이전 모델 타입을 기억
        while ($row = oci_fetch_assoc($stmtC)): 
            // 모델 타입이 이전과 다르면 모델 타입을 출력하고 rowspan을 설정
            if ($previousModelType != $row['MODEL_TYPE']):
                $rowspan = 1; // 모델 타입이 바뀌면 rowspan을 1로 설정
                $previousModelType = $row['MODEL_TYPE'];
                // 이곳에서 동일한 모델 타입이 나올 때까지 반복
                $checkRow = oci_parse($conn, "SELECT COUNT(*) FROM MODEL WHERE MODEL_TYPE = '{$row['MODEL_TYPE']}'");
                oci_execute($checkRow);
                $modelCount = oci_fetch_assoc($checkRow)['COUNT(*)'];
                $rowspan = $modelCount;
            else:
                $rowspan = 0;  // 이전과 동일한 모델 타입은 rowspan을 0으로 설정
            endif;
        ?>
            <tr>
                <!-- 모델 타입은 첫 번째 행에서만 출력하고 rowspan을 설정 -->
                <?php if ($rowspan > 0): ?>
                    <td rowspan="<?= $rowspan ?>"><?= htmlspecialchars($row['MODEL_TYPE']) ?></td>
                <?php endif; ?>
                <td><?= htmlspecialchars($row['MODEL_ID']) ?></td>
                <td><?= htmlspecialchars($row['STOCK_COUNT']) ?></td>
                <td><?= htmlspecialchars($row['SUBSCRIPTION_COUNT']) ?></td>
            </tr>
        <?php endwhile; ?>
    </table>
</div>
</div>


    <?php 
    // 리소스 해제
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_close($conn);
    ?>
</div>


    <?php
    include BASE_PATH . '/includes/footer.php';
?>