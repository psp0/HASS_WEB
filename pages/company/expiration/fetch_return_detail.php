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

    // 폼 출력 (회수 요청 폼)
    ?>
    <div>
        <form id="returnForm" action="fetch_return.php" method="POST">
            <input type="hidden" id="subscription_id" name="subscription_id" value="<?php echo htmlspecialchars($subscriptionId); ?>" />  
            
            <div style="display: flex;">
                <div style="width: 50%; padding: 10px;">
                    <?php if ($subscriptionData): ?>
                        <h3>구독정보</h3>
                        <table border="1">
                            <tr><th>구독 ID</th><td><?php echo htmlspecialchars($subscriptionData['SUBSCRIPTION_ID']); ?></td></tr>
                            <tr><th>구독 년수</th><td><?php echo htmlspecialchars($subscriptionData['SUBSCRIPTION_YEAR']); ?></td></tr>
                            <tr><th>시리얼 번호</th><td><?php echo htmlspecialchars($subscriptionData['SERIAL_NUMBER']); ?></td></tr>
                            <tr><th>구독 시작 일자</th><td><?php echo htmlspecialchars($subscriptionData['BEGIN_DATE']); ?></td></tr>
                            <tr><th>구독 만료 일자</th><td><?php echo htmlspecialchars($subscriptionData['EXPIRED_DATE']); ?></td></tr>
                        </table>
                    <?php endif; ?>
                </div>

                <div style="width: 50%; padding: 10px;">
                    <?php if ($customerData): ?>
                        <h3>고객 정보</h3>
                        <table border="1">
                            <tr><th>고객 ID</th><td><?php echo htmlspecialchars($customerData['CUSTOMER_ID']); ?></td></tr>
                            <tr><th>고객 이름</th><td><?php echo htmlspecialchars($customerData['CUSTOMER_NAME']); ?></td></tr>
                            <tr><th>전화번호</th><td><?php echo htmlspecialchars($customerData['MAIN_PHONE_NUMBER']); ?></td></tr>
                            <tr><th>보조 전화번호</th><td><?php echo htmlspecialchars($customerData['SUB_PHONE_NUMBER']); ?></td></tr>
                            <tr><th>주소</th><td><?php echo htmlspecialchars($customerData['CUSTOMER_ADDRESS']); ?></td></tr>
                        </table>
                    <?php endif; ?>
                </div>
            </div>

            <h3>방문일자 선택<span style='font-size: 0.9em; color: red;'>(현재 시각 기준 24시간 이후 9:00 - 18:00 선택)</span></h3>
            <div>
                <label for="visit_date" class="visit_date"><span class="required-star" style="color: red;">*</span> 방문 일자 및 시간:</label>
                <div class="visit_date-container" style="position: relative;">
                    <input type="datetime-local" id="visit_date" name="visit_date" required>
                    <!-- 오류 아이콘 추가 -->
                    <span id="visit_date_error" class="error-icon" style="color: red; display: none; position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">!</span>
                </div>
            </div>
            
            <div>
                <label for="additional_comment">추가 코멘트</label>
                <div class="additional_comment-container">  
                    <textarea id="additional_comment" name="additional_comment" rows="4" placeholder="추가 코멘트를 입력해주세요." maxlength="1000"></textarea>
                </div>
            </div>
            
            <br>
            <button type="submit" id="returnRequestButton">회수 요청</button>
        </form>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const visitDateInput = document.getElementById('visit_date');
            const visitDateErrorIcon = document.getElementById('visit_date_error');
            const returnForm = document.getElementById('returnForm');
            
            // 사용자 정의 오류 메시지 설정
            const customInvalidMessage = '방문 일자는 현재 시각 기준 24시간 이후로, 오전 9시부터 오후 6시 사이로 선택해주세요.';

            // Set min attribute to current time +24h in Asia/Seoul timezone
            function setMinDateTime() {
                const now = new Date();
                now.setHours(now.getHours() + 24);
                
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                visitDateInput.setAttribute('min', minDateTime);
            }

            setMinDateTime();

            // 입력 시 유효성 검사 및 오류 아이콘 표시
            function validateVisitDate() {
                const selectedDateStr = visitDateInput.value;

                if (!selectedDateStr) {
                    visitDateInput.setCustomValidity('');
                    visitDateInput.classList.remove('input-error');
                    visitDateErrorIcon.style.display = 'none';
                    return;
                }

                // Parse selected date and time
                const selectedDate = new Date(selectedDateStr);
                if (isNaN(selectedDate.getTime())) {
                    visitDateInput.setCustomValidity('유효한 날짜와 시간을 선택해주세요.');
                    visitDateInput.classList.add('input-error');
                    visitDateErrorIcon.style.display = 'inline';
                    return;
                }

                // Get minDate from the input's min attribute
                const minDateStr = visitDateInput.getAttribute('min');
                const minDate = new Date(minDateStr);

                // Check if selectedDate is before minDate
                if (selectedDate < minDate) {
                    visitDateInput.setCustomValidity(customInvalidMessage);
                    visitDateInput.classList.add('input-error');
                    visitDateErrorIcon.style.display = 'inline';
                    return;
                }

                // Check if time is between 09:00 and 18:00
                const hours = selectedDate.getHours();
                if (hours < 9 || hours >= 18) {
                    visitDateInput.setCustomValidity(customInvalidMessage);
                    visitDateInput.classList.add('input-error');
                    visitDateErrorIcon.style.display = 'inline';
                    return;
                }

                // If all checks pass, reset the custom validity and hide error icon
                visitDateInput.setCustomValidity('');
                visitDateInput.classList.remove('input-error');
                visitDateErrorIcon.style.display = 'none';
            }

            // Validate on input and change
            visitDateInput.addEventListener('input', validateVisitDate);
            visitDateInput.addEventListener('change', validateVisitDate);

            // Handle form submission
            returnForm.addEventListener('submit', function(event) {
                validateVisitDate();

                if (!visitDateInput.checkValidity()) {
                    alert(visitDateInput.validationMessage);
                    event.preventDefault(); // Prevent form submission
                    return;
                }
                // Else, allow form to be submitted
            });
        });
    </script>
    <?php
} else {
    echo "<p class='error'>구독 ID 또는 고객 ID가 제공되지 않았습니다.</p>";
}
?>
