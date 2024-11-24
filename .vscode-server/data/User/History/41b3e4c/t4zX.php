<?php
require '../../../config.php';

$requestId = $_POST['requestId'] ?? null;  // 요청 ID 가져오기
$requestStatus = $_POST['requestStatus'] ?? null;  // 요청 상태 가져오기

if ($requestId) {
    $config = require '../../../config.php'; 
    // 데이터베이스 연결 문자열 설정
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');
    
    if (!$conn) {
        echo "<p class='error'>연결 실패: " . htmlspecialchars(oci_error()['message']) . "</p>";
        exit;
    }
    
    // A: 요청 ID로 요청 정보 조회
    $queryA = "
    SELECT 
        REQUEST_ID,
        REQUEST_TYPE,
        REQUEST_STATUS,
        ADDITIONAL_COMMENT,
        TO_CHAR(DATE_CREATED, 'YY.MM.DD HH24:MI') AS DATE_CREATED,
        TO_CHAR(DATE_EDITED, 'YY.MM.DD HH24:MI') AS DATE_EDITED,
        SUBSCRIPTION_ID
    FROM REQUEST
    WHERE REQUEST_ID = :REQUEST_ID
    ";
    
    $stmtA = oci_parse($conn, $queryA);
    oci_bind_by_name($stmtA, ":REQUEST_ID", $requestId);
    oci_execute($stmtA);

    $requestData = null;
    while ($row = oci_fetch_assoc($stmtA)) {
        $requestData = $row;
    }
    
    // B: 요청 상태에 따라 다른 쿼리 실행
    $queryB = "";
    if ($requestStatus === '대기중') {
        $queryB = "
        SELECT TO_CHAR(PREFER_DATE , 'YY.MM.DD HH24:MI') AS PREFER_DATE 
        FROM REQUEST_PREFERENCE_DATE 
        WHERE REQUEST_ID = :REQUEST_ID
        ";
    } elseif (in_array($requestStatus, ['방문예정', '방문완료'])) {
        $queryB = "
        SELECT 
        TO_CHAR(VISIT_DATE , 'YY.MM.DD HH24:MI') AS VISIT_DATE ,
        TO_CHAR(DATE_CREATED , 'YY.MM.DD HH24:MI') AS DATE_CREATED         
        FROM VISIT
        WHERE REQUEST_ID = :REQUEST_ID
        ";
    }

    $stmtB = oci_parse($conn, $queryB);
    oci_bind_by_name($stmtB, ":REQUEST_ID", $requestId);
    oci_execute($stmtB);

    $additionalData = [];
    while ($row = oci_fetch_assoc($stmtB)) {
        $additionalData[] = $row;
    }

    // C: 요청 ID로 고객 정보 조회
    $queryC = "
    SELECT 
        CUSTOMER.CUSTOMER_ID,
        CUSTOMER.CUSTOMER_NAME,
        CUSTOMER.MAIN_PHONE_NUMBER,
        CUSTOMER.SUB_PHONE_NUMBER,
        TO_CHAR(CUSTOMER.DATE_CREATED, 'YY.MM.DD HH24:MI') AS DATE_CREATED,
        TO_CHAR(CUSTOMER.DATE_EDITED, 'YY.MM.DD HH24:MI') AS DATE_EDITED,
        (
            SELECT 
                CUSTOMER_ADDRESS.STREET_ADDRESS || ' ' || CUSTOMER_ADDRESS.DETAILED_ADDRESS
            FROM 
                CUSTOMER_ADDRESS 
            WHERE
                CUSTOMER_ADDRESS.CUSTOMER_ID = CUSTOMER.CUSTOMER_ID
        ) AS CUSTOMER_ADDRESS
    FROM CUSTOMER 
    WHERE CUSTOMER.CUSTOMER_ID = (
        SELECT CUSTOMER_ID 
        FROM SUBSCRIPTION 
        WHERE SUBSCRIPTION_ID = (
            SELECT SUBSCRIPTION_ID 
            FROM REQUEST 
            WHERE REQUEST_ID = :REQUEST_ID
        )
    )";
    
    $stmtC = oci_parse($conn, $queryC);
    oci_bind_by_name($stmtC, ":REQUEST_ID", $requestId);
    oci_execute($stmtC);

    $customerData = null;
    while ($row = oci_fetch_assoc($stmtC)) {
        $customerData = $row;
    }

    $queryD = "
    SELECT WORKER.ID,WORKER_NAME FROM WORKER WHERE WORKER_ID = (SELECT WORKER_ID FROM VISIT WHERE REQUEST_ID = :REQUEST_ID)";
    $stmtD = oci_parse($conn, $queryD);
    oci_bind_by_name($stmtD, ":REQUEST_ID", $requestId);
    oci_execute($stmtD);

    $workerData = null;
    while ($row = oci_fetch_assoc($stmtD)) {
        $workerData = $row;
    }

    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_free_statement($stmtD);
    oci_close($conn);

    // 데이터 출력 (테이블 형식)
    if ($requestData ){
        // 요청 정보 출력
        echo "<h3>요청 정보</h3>";
        echo "<table border='1'>";
        echo "<tr><th>요청 ID</th><td>" . htmlspecialchars($requestData['REQUEST_ID']) . "</td></tr>";
        echo "<tr><th>요청 유형</th><td>" . htmlspecialchars($requestData['REQUEST_TYPE']) . "</td></tr>";
        echo "<tr><th>요청 상태</th><td>" . htmlspecialchars($requestData['REQUEST_STATUS']) . "</td></tr>";
        echo "<tr><th>기타 코멘트</th><td>" . htmlspecialchars($requestData['ADDITIONAL_COMMENT']) . "</td></tr>";
        echo "<tr><th>구독 ID</th><td>" . htmlspecialchars($requestData['SUBSCRIPTION_ID']) . "</td></tr>";
        echo "<tr><th>생성일</th><td>" . htmlspecialchars($requestData['DATE_CREATED']) . "</td></tr>";
        echo "<tr><th>수정일</th><td>" . htmlspecialchars($requestData['DATE_EDITED']) . "</td></tr>";
        echo "</table>";
    }
        if ($additionalData) {
            echo "<h3>방문 정보</h3>";
            echo "<table border='1'>";
                
            if ($requestStatus === '대기중') {
                if (count($additionalData) == 2) {
                    echo "<tr><th rowspan=2>선호 날짜</th><td>" . htmlspecialchars($additionalData[0]['PREFER_DATE']) . "</td></tr>";
                    echo "<tr><td>" . htmlspecialchars($additionalData[1]['PREFER_DATE']) . "</td></tr>";
                } else {
                    echo "<tr><th>선호 날짜</th><td>" . htmlspecialchars($additionalData[0]['PREFER_DATE']) . "</td></tr>";
                }
            } else {
                foreach ($additionalData as $data) {
                    echo "<tr><th>방문 일자</th><td>" . htmlspecialchars($data['VISIT_DATE']) . "</td></tr>";
                    echo "<tr><th>방문예정 확정일</th><td>" . htmlspecialchars($data['DATE_CREATED']) . "</td></tr>";
                }
            }
            echo "</table>";
        }
   
        if($customerData){
        // 고객 정보 출력
        echo "<h3>고객 정보</h3>";
        echo "<table border='1'>";
        echo "<tr><th>고객 ID</th><td>" . htmlspecialchars($customerData['CUSTOMER_ID']) . "</td></tr>";
        echo "<tr><th>고객 이름</th><td>" . htmlspecialchars($customerData['CUSTOMER_NAME']) . "</td></tr>";
        echo "<tr><th>주요 전화번호</th><td>" . htmlspecialchars($customerData['MAIN_PHONE_NUMBER']) . "</td></tr>";
        echo "<tr><th>보조 전화번호</th><td>" . htmlspecialchars($customerData['SUB_PHONE_NUMBER']) . "</td></tr>";
        echo "<tr><th>주소</th><td>" . htmlspecialchars($customerData['CUSTOMER_ADDRESS']) . "</td></tr>";
        echo "<tr><th>생성일</th><td>" . htmlspecialchars($customerData['DATE_CREATED']) . "</td></tr>";
        echo "<tr><th>수정일</th><td>" . htmlspecialchars($customerData['DATE_EDITED']) . "</td></tr>";
        echo "</table>";
        }
       if($workerData){
            echo "<h3>작업자 정보</h3>";
            echo "<table border='1'>";
            echo "작업자 ID: " . htmlspecialchars($workerData['ID']) . "<br>";
            echo "작업자 이름: " . htmlspecialchars(string: $workerData['WORKER_NAME']) . "<br>";
            echo "</table>";
       }

      
} else {
    echo "<p class='error'>요청 ID가 제공되지 않았습니다.</p>";
}
?>
