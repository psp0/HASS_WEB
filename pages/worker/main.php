<?php
require '../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
    }

    .data-container {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        height: calc(100vh - 90px); 
        box-sizing: border-box;
    }

    .left-section,
    .right-section {
        padding: 20px;
        box-sizing: border-box;
        overflow-y: auto;
    }

    .left-section {
        flex: 1 1 70%;
        min-width: 300px;
    }

    .right-section {
        flex: 1 1 30%;
        min-width: 300px;
        border-left: 2px solid #ccc;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background-color: #fff;
        margin-bottom: 20px;
    }

    th,
    td {
        padding: 12px 15px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        background-color: #d1d5db;
        color: #4b5563;
        position: sticky;
        top: 0;
        z-index: 1;
        font-size: 1em;
        border-bottom: 2px solid #ddd;
    }


    tr {
        border-bottom: 1px solid #ddd;
    }


    tr:last-child {
        border-bottom: none;
    }

    .table-container {
        max-height: 50vh;
        overflow-y: auto;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.5em;
        color: #007bff;
    }
    
</style>
<div class="data-container">
    <?php
    $config = require '../../config.php';
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

    $queryA = "SELECT   
    REQUEST.SUBSCRIPTION_ID,
    (SELECT MODEL_TYPE
     FROM MODEL
     WHERE MODEL_ID = (
         SELECT MODEL_ID
         FROM PRODUCT
         WHERE SERIAL_NUMBER = (SELECT SERIAL_NUMBER FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID =  REQUEST.SUBSCRIPTION_ID)
     )
    ) AS MODEL_TYPE,
    REQUEST.REQUEST_TYPE,
    TO_CHAR(REQUEST.DATE_CREATED, 'YY.MM.DD HH24:MI') AS DATE_CREATED
FROM 
    REQUEST
WHERE 
    REQUEST_STATUS = '대기중'
ORDER BY 
    REQUEST.DATE_CREATED DESC";

    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);

    $queryB = "SELECT 
    TO_CHAR(V.VISIT_DATE, 'YY.MM.DD HH24:MI') AS VISIT_DATE_FORMATTED,
    R.REQUEST_TYPE,
    C.CUSTOMER_NAME,
    C.MAIN_PHONE_NUMBER,
    CA.STREET_ADDRESS,
    CA.DETAILED_ADDRESS,
    W.WORKER_NAME
FROM 
    REQUEST R
JOIN 
    VISIT V ON R.REQUEST_ID = V.REQUEST_ID
JOIN 
    SUBSCRIPTION S ON R.SUBSCRIPTION_ID = S.SUBSCRIPTION_ID
JOIN 
    CUSTOMER C ON S.CUSTOMER_ID = C.CUSTOMER_ID
JOIN 
    CUSTOMER_ADDRESS CA ON C.CUSTOMER_ID = CA.CUSTOMER_ID
JOIN 
    WORKER W ON V.WORKER_ID = W.WORKER_ID
WHERE 
    R.REQUEST_STATUS = '방문예정'
ORDER BY 
    V.VISIT_DATE DESC";


    $stmtB = oci_parse($conn, $queryB);
    oci_execute($stmtB);

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

    <div class="data-container">
        <div class="left-section">
            <div class="section" id="A">
                <h3>대기중인 요청</h3>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>구독 ID</th>
                            <th>가전제품 종류</th>
                            <th>요청 종류</th>
                            <th>생성일</th>
                        </tr>
                        <?php while ($row = oci_fetch_assoc($stmtA)): ?>
                            <tr>
                                <td><?= htmlspecialchars($row['SUBSCRIPTION_ID']) ?></td>
                                <td><?= htmlspecialchars($row['MODEL_TYPE']) ?></td>
                                <td><?= htmlspecialchars($row['REQUEST_TYPE']) ?></td>
                                <td><?= htmlspecialchars($row['DATE_CREATED']) ?></td>
                            </tr>
                        <?php endwhile; ?>
                    </table>
                </div>
            </div>

            <div class="section" id="B">
                <h3>방문예정</h3>
                <div class="table-container">
                    <table>
                        <tr>

                            <th>고객 이름</th>
                            <th>메인 전화 번호</th>
                            <th>주소</th>
                            <th>방문 예정 일자</th>
                            <th>요청 종류</th>
                            <th>기사 이름</th>
                        </tr>
                        <?php while ($row = oci_fetch_assoc($stmtB)): ?>
                            <tr>
                                <td><?= htmlspecialchars($row['CUSTOMER_NAME']) ?></td>
                                <td><?= htmlspecialchars($row['MAIN_PHONE_NUMBER']) ?></td>
                                <td><?= htmlspecialchars($row['STREET_ADDRESS']) ?> <?= htmlspecialchars($row['DETAILED_ADDRESS']) ?></td>
                                <td><?= htmlspecialchars($row['VISIT_DATE_FORMATTED']) ?></td>
                                <td><?= htmlspecialchars($row['REQUEST_TYPE']) ?></td>
                                <td><?= htmlspecialchars($row['WORKER_NAME']) ?></td>
                            </tr>
                        <?php endwhile; ?>
                    </table>
                </div>
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
                    $previousModelType = '';
                    while ($row = oci_fetch_assoc($stmtC)):
                        if ($previousModelType != $row['MODEL_TYPE']):
                            $rowspan = 1;
                            $previousModelType = $row['MODEL_TYPE'];
                            $checkRow = oci_parse($conn, "SELECT COUNT(*) FROM MODEL WHERE MODEL_TYPE = '{$row['MODEL_TYPE']}'");
                            oci_execute($checkRow);
                            $modelCount = oci_fetch_assoc($checkRow)['COUNT(*)'];
                            $rowspan = $modelCount;
                        else:
                            $rowspan = 0;
                        endif;
                    ?>
                        <tr>
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
    </div>

    <?php
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_close($conn);
    ?>
</div>

<?php
include BASE_PATH . '/includes/footer.php';
?>