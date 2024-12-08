<?php
require '../../../config.php';

$subscriptionId = $_POST['subscriptionId'] ?? null;  
$customerId = $_POST['customerId'] ?? null;  

if ($subscriptionId && $customerId) {
    $config = require '../../../config.php'; 
    // 데이터베이스 연결 문자열 설정
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');
    
    if (!$conn) {
        echo "<p class='error'>연결 실패: " . htmlspecialchars(oci_error()['message']) . "</p>";
        exit;
    }
    

    

    $queryA = "SELECT
    SUBSCRIPTION_ID,    
    SUBSCRIPTION_YEAR,    
    TO_CHAR(SUBSCRIPTION.BEGIN_DATE, 'YY.MM.DD HH24:MI') AS BEGIN_DATE,  
    TO_CHAR(ADD_MONTHS(SUBSCRIPTION.BEGIN_DATE, SUBSCRIPTION.SUBSCRIPTION_YEAR * 12), 'YY.MM.DD HH24:MI') AS EXPIRED_DATE, 
    SERIAL_NUMBER    
    FROM
        SUBSCRIPTION
    WHERE
    SUBSCRIPTION_ID=:SUBSCRIPTION_ID";
    
    $stmtA = oci_parse($conn, $queryA);
    oci_bind_by_name($stmtA, ":SUBSCRIPTION_ID", $subscriptionId);
    oci_execute($stmtA);

    $subscriptionData = null;
    while ($row = oci_fetch_assoc($stmtA)) {
        $subscriptionData = $row;
    }
    
  



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
    WHERE CUSTOMER.CUSTOMER_ID =:CUSTOMER_ID
        ";
    
    $stmtC = oci_parse($conn, $queryC);
    oci_bind_by_name($stmtC, ":CUSTOMER_ID", $customerId);
    oci_execute($stmtC);

    $customerData = null;
    while ($row = oci_fetch_assoc($stmtC)) {
        $customerData = $row;
    }

    oci_free_statement($stmtA); 
    oci_free_statement($stmtC);


    oci_close($conn);

   
    echo "<div style='display: flex;'>";


    echo "<div style='width: 50%; padding: 10px;'>";
    if ($subscriptionData) {
    
        echo "<h3>구독정보</h3>";
        echo "<table border='1'>";
        echo "<tr><th>구독 ID</th><td>" . htmlspecialchars($subscriptionData['SUBSCRIPTION_ID']) . "</td></tr>";
        echo "<tr><th>구독 년수</th><td>" . htmlspecialchars($subscriptionData['SUBSCRIPTION_YEAR']) . "</td></tr>";
        echo "<tr><th>시리얼 번호</th><td>" . htmlspecialchars($subscriptionData['SERIAL_NUMBER']) . "</td></tr>";
        echo "<tr><th>구독 시작 일자</th><td>" . htmlspecialchars($subscriptionData['BEGIN_DATE']) . "</td></tr>";
        echo "<tr><th>구독 만료 일자</th><td>" . htmlspecialchars($subscriptionData['EXPIRED_DATE']) . "</td></tr>";
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

    echo "</div>"; // b, d 구역 종료

    echo "</div>"; // 전체 구역 종료
     
 

    echo "<h3><span class='required-star'>*</span> 연장할 년수 선택</h3>";
    echo "<form action='fetch_extend.php' method='POST'>";
    echo "<input type='hidden' id='subscriptionId' name='subscriptionId' value='" . htmlspecialchars($subscriptionId) . "' />";  
        
    // 전문가 선택 박스
    echo "<select name='extension_years' id='extension_years'required>";
    echo "<option value='' selected disabled>선택하세요</option>"; 
    echo "<option value='1'>+1년</option>";
    echo "<option value='2'>+2년</option>";
    echo "<option value='3'>+3년</option>";
    echo "<option value='4'>+4년</option>";
    echo "<option value='5'>+5년</option>";
    echo "</select>";
        
    // 제출 버튼
    echo "<br><button type='submit' id='subscriptionExtendButton'>구독 연장</button>";
    echo "</form>";
    
    

        
    

} else {
    echo "<p class='error'>구독 ID가 제공되지 않았습니다.</p>";
}
?>

<!-- 
<script>
function validateVisitForm() {
    var specialWorker = document.getElementById("special_worker").value;
    var visitDate = document.getElementById("visit_date") ? document.getElementById("visit_date").value :
        ''; // 방문일자 선택이 있을 경우만 체크

    if (specialWorker === "" || (count($additionalData) == 2 && visitDate === "")) {
        event.preventDefault();
        alert("모든 란을 입력해 주세요.");
        return false; // 폼 제출을 막습니다.
    }
    return true; // 폼을 정상적으로 제출합니다.
}
</script> -->