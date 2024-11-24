<?php
require '../../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<style>
    .data-container {
        display: block;
        width: 100%;
        height: 100vh;
        overflow-y: auto;
    }

    .section {
        padding: 10px;
        box-sizing: border-box;
        margin-bottom: 20px;
        overflow-y: auto;
    }

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

    .table-container {
        max-height: 30vh;
        overflow-y: auto;
    }

    h2 {
        color: #007bff;
        font-size: 1.5em;
        margin-bottom: 10px;
    }

    .error {
        color: red;
        font-weight: bold;
    }
/* Modal Styles */
.modal {
    display: none; 
    position: fixed; 
    z-index: 1; 
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4); /* 배경 어두운 색 */
    padding-top: 60px;
}

.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 50%;
    max-width: 600px;
}

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

/* 테이블의 tr에 마우스 오버 시 스타일 추가 */
.styled-table tr:hover {
    background-color: #f1f1f1; /* 배경 색상 변경 */
    cursor: pointer; /* 클릭 가능한 커서로 변경 */
}


</style>
<script>
// Function to show modal and fetch request details
function showModal(requestId) {
    // Fetch request details using AJAX
    fetchRequestDetails(requestId);

    // Show modal
    var modal = document.getElementById('requestModal');
    modal.style.display = "block";
}

// Function to fetch request details via AJAX
function fetchRequestDetails(requestId,requestStatus) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "fetch_request_detail.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Populate the modal with data
            document.getElementById('modalContent').innerHTML = xhr.responseText;
        }
    };
    xhr.send("requestId=" + encodeURIComponent(requestId));
    xhr.send("requestStatus="+encodeURIComponent(requestStatus))
}

// Modal close function
document.addEventListener('DOMContentLoaded', function () {
    var span = document.getElementsByClassName('close')[0];
    span.onclick = function() {
        var modal = document.getElementById('requestModal');
        modal.style.display = "none";
    }
});

window.onclick = function(event) {
    var modal = document.getElementById('requestModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
</script>



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

    echo "<div class='section'>
            <h2>요청 관리</h2>
            <div class='table-container'>
                <table class='styled-table'>
                <thead>
                    <tr>
                        <th>요청 ID</th>
                        <th>모델 ID</th>
                        <th>요청 종류</th>
                        <th>요청 상태</th>
                        <th>방문 (선호) 일자</th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowA = oci_fetch_assoc($stmtA)) {
        echo "<tr onclick='showModal(" . htmlspecialchars($rowA['REQUEST_ID']) . ")'>";
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

    echo "<div class='section'>
            <h2>지난 요청</h2>
            <div class='table-container'>
                <table class='styled-table'>
                <thead>
                    <tr>
                        <th>요청 ID</th>
                        <th>모델 ID</th>
                        <th>요청 종류</th>
                        <th>방문 일자</th>
                        <th>작업자 이름</th>
                    </tr>
                </thead>
                <tbody>";

    while ($rowB = oci_fetch_assoc($stmtB)) {
        echo "<tr onclick='showModal(" . htmlspecialchars($rowB['REQUEST_ID']) . ")'>";
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

    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_close($conn);
    ?>
</div>
<!-- Modal -->
<div id="requestModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>요청 세부사항</h2>
        <div id="modalContent">
            <!-- AJAX-loaded content will be displayed here -->
        </div>      
    </div>
</div>


<?php
    include BASE_PATH . '/includes/footer.php';
?>
