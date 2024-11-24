<?php
require '../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<style>
.data-container {
    display: flex;
    width: 100%;
    height: 100vh;
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

.table-container {
    max-height: 50vh;
    overflow-y: auto;
}

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
    $config = require '../../config.php'; 
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

    if (!$conn) {
        $e = oci_error();
        echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
        exit;
    }

    $queryA = "SELECT
    SUBSCRIPTION.SUBSCRIPTION_ID,
    SUBSCRIPTION.CUSTOMER_ID,
    SUBSCRIPTION.EXPIRED_DATE
FROM
    SUBSCRIPTION
LEFT JOIN REQUEST ON SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID
    AND REQUEST.REQUEST_TYPE = '회수'
WHERE
    SUBSCRIPTION.EXPIRED_DATE < SYSDATE
    AND REQUEST.SUBSCRIPTION_ID IS NULL;

ORDER BY
    EXPIRED_DATE ASC;";

    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);


    ?>
    
    <div class="data-container">

        <div class="section" id="A">
            <h3>만료된 구독</h3>
            <div class="table-container">
                <table>
                    <tr>
                        <th>구독 ID</th>
                        <th>고객 ID</th>
                        <th>구독 만료일자</th>                        
                    </tr>
                    <?php while ($row = oci_fetch_assoc($stmtA)): ?>
                        <tr>
                            <td><?= htmlspecialchars($row['SUBSCRIPTION_ID']) ?></td>
                            <td><?= htmlspecialchars($row['CUSTOMER_ID']) ?></td>
                            <td><?= htmlspecialchars($row['EXPIRED_DATE']) ?></td>
                            
                        </tr>
                    <?php endwhile; ?>
                </table>
            </div>
    

    </div>

</div>

    <?php 
    oci_free_statement($stmtA);
    oci_close($conn);
    ?>
</div>

    <?php
    include BASE_PATH . '/includes/footer.php';
?>
