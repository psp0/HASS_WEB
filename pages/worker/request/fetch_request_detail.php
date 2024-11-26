<?php
require '../../../config.php';

$requestId = $_POST['requestId'] ?? null;  // 요청 ID 가져오기

if ($requestId) {
    $config = require '../../../config.php'; 
    // 데이터베이스 연결 문자열 설정
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');
    
    if (!$conn) {
        echo "<p class='error'>연결 실패: " . htmlspecialchars(oci_error()['message']) . "</p>";
        exit;
    }
    
    // A: 요청 상태 조회
    $requestStatusQuery = "SELECT REQUEST_STATUS,REQUEST_TYPE FROM REQUEST WHERE REQUEST_ID = :REQUEST_ID";
    $stmtRequestStatus = oci_parse($conn, $requestStatusQuery);
    oci_bind_by_name($stmtRequestStatus, ":REQUEST_ID", $requestId);
    oci_execute($stmtRequestStatus);

    $requestStatus = null;
    $requestType = null;
    while ($row = oci_fetch_assoc($stmtRequestStatus)) {
        $requestStatus = $row['REQUEST_STATUS'];  
        $requestType = $row['REQUEST_TYPE'];
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
        SUBSCRIPTION_ID,
        (SELECT SERIAL_NUMBER FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID) AS SERIAL_NUMBER
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
        SELECT TO_CHAR(PREFER_DATE , 'YY.MM.DD HH24:MI') AS PREFER_DATE,
        PREFERENCE_ID 
        FROM REQUEST_PREFERENCE_DATE 
        WHERE REQUEST_ID = :REQUEST_ID
        ";
    } else{
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
    SELECT WORKER_ID,WORKER_NAME,WORKER_SPECIALITY 
    FROM WORKER 
    WHERE WORKER_ID =
     (SELECT WORKER_ID FROM VISIT WHERE REQUEST_ID = :REQUEST_ID)";
    $stmtD = oci_parse($conn, $queryD);
    oci_bind_by_name($stmtD, ":REQUEST_ID", $requestId);
    oci_execute($stmtD);

    $workerData = null;
    while ($row = oci_fetch_assoc($stmtD)) {
        $workerData = $row;
    }    
if($requestStatus==="대기중"){
        $querySpecialWorker= "SELECT
        WORKER_ID,WORKER_NAME
        FROM WORKER
        WHERE WORKER_SPECIALITY =     
        (SELECT MODEL_TYPE
        FROM MODEL
        WHERE MODEL_ID = (SELECT MODEL_ID
        FROM PRODUCT
        WHERE SERIAL_NUMBER=(SELECT SERIAL_NUMBER FROM SUBSCRIPTION
        WHERE SUBSCRIPTION_ID= (SELECT SUBSCRIPTION_ID FROM REQUEST WHERE REQUEST_ID=:REQUEST_ID))))
    ";
    $stmtSworker = oci_parse($conn, $querySpecialWorker);
    oci_bind_by_name($stmtSworker, ":REQUEST_ID", $requestId);
    oci_execute($stmtSworker);

    $specialWorkerData = [];
    while ($row = oci_fetch_assoc($stmtSworker)) {
        $specialWorkerData[] = $row;
    }
    oci_free_statement($stmtSworker);
}
    oci_free_statement($stmtRequestStatus);
    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_free_statement($stmtD);

    oci_close($conn);

   
    echo "<div style='display: flex;'>";


    echo "<div style='width: 50%; padding: 10px;'>";
    if ($requestData) {
        // 요청 정보 출력
        echo "<h3>요청 정보</h3>";
        echo "<table border='1'>";
        echo "<tr><th>요청 ID</th><td>" . htmlspecialchars($requestData['REQUEST_ID']) . "</td></tr>";
        echo "<tr><th>제품 시리얼</th><td>" . htmlspecialchars($requestData['SERIAL_NUMBER']) . "</td></tr>";
        echo "<tr><th>요청 유형</th><td>" . htmlspecialchars($requestData['REQUEST_TYPE']) . "</td></tr>";
        echo "<tr><th>요청 상태</th><td>" . htmlspecialchars($requestData['REQUEST_STATUS']) . "</td></tr>";
        echo "<tr><th>기타 코멘트</th><td>" . htmlspecialchars($requestData['ADDITIONAL_COMMENT']) . "</td></tr>";
        echo "<tr><th>구독 ID</th><td>" . htmlspecialchars($requestData['SUBSCRIPTION_ID']) . "</td></tr>";        
        echo "<tr><th>등록일</th><td>" . htmlspecialchars($requestData['DATE_CREATED']) . "</td></tr>";
        echo "<tr><th>수정일</th><td>" . htmlspecialchars($requestData['DATE_EDITED']) . "</td></tr>";
        echo "</table>";
    
    }
    if ($additionalData) {
        echo "<h3>방문 정보</h3>";
        echo "<table border='1'>";
        if ($requestStatus === '대기중') {
            if (count($additionalData) == 2) {
                echo "<tr><th rowspan=2>방문 선호 일자</th><td>" . htmlspecialchars($additionalData[0]['PREFER_DATE']) . "</td></tr>";
                echo "<tr><td>" . htmlspecialchars($additionalData[1]['PREFER_DATE']) . "</td></tr>";
            } else {
                echo "<tr><th>방문 선호 일자</th><td>" . htmlspecialchars($additionalData[0]['PREFER_DATE']) . "</td></tr>";
            }
        } else {
            foreach ($additionalData as $data) {
                echo "<tr><th>방문 일자</th><td>" . htmlspecialchars($data['VISIT_DATE']) . "</td></tr>";
                echo "<tr><th>방문 수락일</th><td>" . htmlspecialchars($data['DATE_CREATED']) . "</td></tr>";
            }
        }
        echo "</table>";
    }
   
    echo "</div>"; 

  
    echo "<div style='width: 50%; padding: 10px;'>";
   
    if ($customerData ) {
            echo "<h3>고객 정보</h3>";
            echo "<table border='1'>";
            echo "<tr><th>고객 ID</th><td>" . htmlspecialchars($customerData['CUSTOMER_ID']) . "</td></tr>";
            echo "<tr><th>고객 이름</th><td>" . htmlspecialchars($customerData['CUSTOMER_NAME']) . "</td></tr>";
            echo "<tr><th>전화번호</th><td>" . htmlspecialchars($customerData['MAIN_PHONE_NUMBER']) . "</td></tr>";
            echo "<tr><th>보조 전화번호</th><td>" . htmlspecialchars($customerData['SUB_PHONE_NUMBER']) . "</td></tr>";
            echo "<tr><th>주소</th><td>" . htmlspecialchars($customerData['CUSTOMER_ADDRESS']) . "</td></tr>";
            echo "</table>";       
    }

    if ($workerData) {
        // 기사 정보 출력
        echo "<h3>기사 정보</h3>";
        echo "<table border='1'>";
        echo "<tr><th>기사 ID</th><td>" . htmlspecialchars($workerData['WORKER_ID']) . "</td></tr>";
        echo "<tr><th>전문분야</th><td>" . htmlspecialchars($workerData['WORKER_SPECIALITY']) . "</td></tr>";
        echo "<tr><th>기사 이름</th><td>" . htmlspecialchars($workerData['WORKER_NAME']) . "</td></tr>";
        echo "</table>";
        
    }
    echo "</div>"; // b, d 구역 종료

    echo "</div>"; // 전체 구역 종료
     
 
    if ($requestStatus === '대기중') {
echo "<h3>기사 및 방문일자 선택</h3>";
echo "<form action='fetch_accept.php' method='POST' onsubmit='return validateVisitForm()'>";
echo "<input type='hidden' id='request_id' name='request_id' value='" . htmlspecialchars($requestId) . "' />";
// 전문가 선택 박스
echo "<label for='special_worker'>설치 제품 전문기사 선택:</label>";
echo "<select name='special_worker' id='special_worker'>";
echo "<option value=''>선택하세요</option>";

if ($specialWorkerData) {                              
    foreach ($specialWorkerData as $worker) {                
        echo "<option value='" . htmlspecialchars($worker['WORKER_ID']) . "'>" . htmlspecialchars($worker['WORKER_ID']) . '-' . htmlspecialchars($worker['WORKER_NAME']) . "</option>";
    }
    
}
echo "</select>";

if (count($additionalData) == 2) {
    // 방문 일자 선택 박스
    echo "<br><label for='visit_date'>방문일자 선택:</label>";
    echo "<select name='visit_date' id='visit_date'>";
    echo "<option value=''>선택하세요</option>";    
    echo "<option value='" . htmlspecialchars($additionalData[0]['PREFER_DATE']) . "'>" . htmlspecialchars($additionalData[0]['PREFER_DATE']) . "</option>";
    echo "<option value='" . htmlspecialchars($additionalData[1]['PREFER_DATE']) . "'>" . htmlspecialchars($additionalData[1]['PREFER_DATE']) . "</option>";
    echo "</select>";    
    
} 

// 제출 버튼
echo "<br><button type='submit' id='acceptRequestButton'>요청 수락</button>";
echo "</form>";

        
    }
    elseif($requestStatus === "방문예정"){
        echo "<form action='fetch_visit.php' method='POST'>";
        if($requestType === '고장'){
            // 고장 증상 입력란 추가
            echo "<label for='problem_detail'>고장 증상:</label><br>";
            echo "<textarea id='problem_detail' name='problem_detail' rows='4' cols='50' placeholder='고장 증상을 입력하세요'></textarea><br><br>";
            
            // 수리 내용 입력란 추가
            echo "<label for='solution_detail'>수리 내용:</label><br>";
            echo "<textarea id='solution_detail' name='solution_detail' rows='4' cols='50' placeholder='수리 내용을 입력하세요'></textarea><br><br>";
    
        }
        echo "<input type='hidden' id='request_id' name='request_id' value='" . htmlspecialchars($requestId) . "' />";        
    
        // 방문 완료 버튼
        echo "<button id='visitSuccessButton'>방문 완료</button>";
        echo "</form>";
    }
    
        

} else {
    echo "<p class='error'>요청 ID가 제공되지 않았습니다.</p>";
}
?>


<script>
function validateVisitForm() {
    var specialWorker = document.getElementById("special_worker").value;
    var visitDate = document.getElementById("visit_date") ? document.getElementById("visit_date").value : ''; // 방문일자 선택이 있을 경우만 체크

    if (specialWorker === "" || (count($additionalData) == 2 && visitDate === "" )) {
        event.preventDefault(); 
        alert("모든 란을 입력해 주세요.");
        return false; // 폼 제출을 막습니다.
    }
    return true; // 폼을 정상적으로 제출합니다.
}
</script>