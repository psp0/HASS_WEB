<?php
require '../../../config.php';

$requestId = $_POST['requestId'] ?? null;  
$requestStatus = $_POST['requestStatus'] ?? null;  

if ($requestId) {
    $config = require '../../../config.php';
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');
    
    if (!$conn) {
        echo "<p class='error'>연결 실패: " . htmlspecialchars(oci_error()['message']) . "</p>";
        exit;
    }
    
    // Queries for A, B, C, D sections
    // 1. Query A
    $queryA = "SELECT REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, TO_CHAR(DATE_CREATED, 'YY.MM.DD HH24:MI') AS DATE_CREATED, TO_CHAR(DATE_EDITED, 'YY.MM.DD HH24:MI') AS DATE_EDITED, SUBSCRIPTION_ID FROM REQUEST WHERE REQUEST_ID = :REQUEST_ID";
    $stmtA = oci_parse($conn, $queryA);
    oci_bind_by_name($stmtA, ":REQUEST_ID", $requestId);
    oci_execute($stmtA);
    $requestData = oci_fetch_assoc($stmtA);

    // 2. Query B
    $queryB = ($requestStatus === '대기중') ? 
        "SELECT TO_CHAR(PREFER_DATE , 'YY.MM.DD HH24:MI') AS PREFER_DATE FROM REQUEST_PREFERENCE_DATE WHERE REQUEST_ID = :REQUEST_ID" :
        "SELECT TO_CHAR(VISIT_DATE , 'YY.MM.DD HH24:MI') AS VISIT_DATE, TO_CHAR(DATE_CREATED , 'YY.MM.DD HH24:MI') AS DATE_CREATED FROM VISIT WHERE REQUEST_ID = :REQUEST_ID";
    $stmtB = oci_parse($conn, $queryB);
    oci_bind_by_name($stmtB, ":REQUEST_ID", $requestId);
    oci_execute($stmtB);
    $visitData = oci_fetch_assoc($stmtB);

    // 3. Query C
    $queryC = "SELECT CUSTOMER.CUSTOMER_ID, CUSTOMER.CUSTOMER_NAME, CUSTOMER.MAIN_PHONE_NUMBER, CUSTOMER.SUB_PHONE_NUMBER, TO_CHAR(CUSTOMER.DATE_CREATED, 'YY.MM.DD HH24:MI') AS DATE_CREATED, TO_CHAR(CUSTOMER.DATE_EDITED, 'YY.MM.DD HH24:MI') AS DATE_EDITED, (SELECT CUSTOMER_ADDRESS.STREET_ADDRESS || ' ' || CUSTOMER_ADDRESS.DETAILED_ADDRESS FROM CUSTOMER_ADDRESS WHERE CUSTOMER_ADDRESS.CUSTOMER_ID = CUSTOMER.CUSTOMER_ID) AS CUSTOMER_ADDRESS FROM CUSTOMER WHERE CUSTOMER.CUSTOMER_ID = (SELECT CUSTOMER_ID FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID = (SELECT SUBSCRIPTION_ID FROM REQUEST WHERE REQUEST_ID = :REQUEST_ID))";
    $stmtC = oci_parse($conn, $queryC);
    oci_bind_by_name($stmtC, ":REQUEST_ID", $requestId);
    oci_execute($stmtC);
    $customerData = oci_fetch_assoc($stmtC);

    // 4. Query D
    $queryD = "SELECT WORKER_ID, WORKER_NAME FROM WORKER WHERE WORKER_ID = (SELECT WORKER_ID FROM VISIT WHERE REQUEST_ID = :REQUEST_ID)";
    $stmtD = oci_parse($conn, $queryD);
    oci_bind_by_name($stmtD, ":REQUEST_ID", $requestId);
    oci_execute($stmtD);
    $workerData = oci_fetch_assoc($stmtD);

    // Close statements and connection
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_free_statement($stmtD);
    oci_close($conn);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Modal Layout</title>
    <style>
        /* Modal layout for the four-section grid */
        .modal-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .section {
            padding: 10px;
            border: 1px solid #ddd;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 8px;
            border: 1px solid #ccc;
            text-align: left;
        }
    </style>
</head>
<body>

<div class="modal-grid">
    <!-- Section A: Request Information -->
    <div class="section" id="section-a">
        <h3>요청 정보</h3>
        <?php if ($requestData): ?>
            <table>
                <tr><th>요청 ID</th><td><?= htmlspecialchars($requestData['REQUEST_ID']) ?></td></tr>
                <tr><th>요청 유형</th><td><?= htmlspecialchars($requestData['REQUEST_TYPE']) ?></td></tr>
                <tr><th>요청 상태</th><td><?= htmlspecialchars($requestData['REQUEST_STATUS']) ?></td></tr>
                <tr><th>기타 코멘트</th><td><?= htmlspecialchars($requestData['ADDITIONAL_COMMENT']) ?></td></tr>
                <tr><th>구독 ID</th><td><?= htmlspecialchars($requestData['SUBSCRIPTION_ID']) ?></td></tr>
                <tr><th>생성일</th><td><?= htmlspecialchars($requestData['DATE_CREATED']) ?></td></tr>
                <tr><th>수정일</th><td><?= htmlspecialchars($requestData['DATE_EDITED']) ?></td></tr>
            </table>
        <?php else: ?>
            <p>정보가 없습니다.</p>
        <?php endif; ?>
    </div>

    <!-- Section B: Additional Data -->
    <div class="section" id="section-b">
        <h3>방문 정보</h3>
        <?php if ($visitData): ?>
            <table>
                <?php foreach ($visitData as $key => $value): ?>
                    <tr><th><?= $key ?></th><td><?= htmlspecialchars($value) ?></td></tr>
                <?php endforeach; ?>
            </table>
        <?php else: ?>
            <p>방문 정보가 없습니다.</p>
        <?php endif; ?>
    </div>

    <!-- Section C: Customer Information -->
    <div class="section" id="section-c">
        <h3>고객 정보</h3>
        <?php if ($customerData): ?>
            <table>
                <tr><th>고객 ID</th><td><?= htmlspecialchars($customerData['CUSTOMER_ID']) ?></td></tr>
                <tr><th>고객 이름</th><td><?= htmlspecialchars($customerData['CUSTOMER_NAME']) ?></td></tr>
                <tr><th>주요 전화번호</th><td><?= htmlspecialchars($customerData['MAIN_PHONE_NUMBER']) ?></td></tr>
                <tr><th>보조 전화번호</th><td><?= htmlspecialchars($customerData['SUB_PHONE_NUMBER']) ?></td></tr>
                <tr><th>주소</th><td><?= htmlspecialchars($customerData['CUSTOMER_ADDRESS']) ?></td></tr>
                <tr><th>생성일</th><td><?= htmlspecialchars($customerData['DATE_CREATED']) ?></td></tr>
                <tr><th>수정일</th><td><?= htmlspecialchars($customerData['DATE_EDITED']) ?></td></tr>
            </table>
        <?php else: ?>
            <p>고객 정보가 없습니다.</p>
        <?php endif; ?>
    </div>

    <!-- Section D: Worker Information -->
    <div class="section" id="section-d">
        <h3>작업자 정보</h3>
        <?php if ($workerData): ?>
            <table>
                <tr><th>작업자 ID</th><td><?= htmlspecialchars($workerData['WORKER_ID']) ?></td></tr>
                <tr><th>작업자 이름</th><td><?= htmlspecialchars($workerData['WORKER_NAME']) ?></td></tr>
            </table>
        <?php else: ?>
            <p>작업자 정보가 없습니다.</p>
        <?php endif; ?>
    </div>
</div>

</body>
</html>
