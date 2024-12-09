<?php
require '../../config.php';
include BASE_PATH . '/includes/company_header.php';
?>
<style>
    .data-container {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 85vh;
        overflow-y: auto;
        align-items: flex-start;
    }

    table {
        width: 100%;
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-collapse: collapse;
        margin: auto;
    }

    table,
    th,
    td {
        border: 1px solid #ddd;
    }

    th {
        background-color: #d1d5db;
        color: #4b5563;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .table-container {
        max-height: 50vh;
        overflow-y: auto;
    }

    th,
    td {
        padding: 0.5rem 1rem;
        border-bottom: 1px solid #e5e7eb;
        text-align: center;
    }

    h3 {
    color: #007bff;
    font-size: 1.5em;
    margin-top: 0;
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

    if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'company') {
        echo "<script>alert('회사 전용 페이지 입니다. 회사 로그인을 해주세요.');</script>";
        echo "<script>location.href='" . TEAM_PATH . "/pages/login/company_login.php';</script>";
        exit;
    }

    $queryA = "SELECT
    SUBSCRIPTION.SUBSCRIPTION_ID,
    SUBSCRIPTION.CUSTOMER_ID,
    TO_CHAR(ADD_MONTHS(BEGIN_DATE, SUBSCRIPTION_YEAR * 12), 'YYYY-MM-DD HH24:MI:SS') AS EXPIRED_DATE,
    TO_CHAR(SUBSCRIPTION.BEGIN_DATE, 'YY.MM.DD HH24:MI') AS BEGIN_DATE,
    SUBSCRIPTION.SERIAL_NUMBER
FROM
    SUBSCRIPTION
LEFT JOIN REQUEST ON SUBSCRIPTION.SUBSCRIPTION_ID = REQUEST.SUBSCRIPTION_ID
    AND REQUEST.REQUEST_TYPE = '회수'
WHERE
     REQUEST.SUBSCRIPTION_ID IS NULL
ORDER BY
    EXPIRED_DATE ASC";


    $stmtA = oci_parse($conn, $queryA);
    oci_execute($stmtA);


    ?>

    <div class="data-container">

        <div class="section" id="A">
            <h3>구독 현황</h3>
            <div class="table-container">
                <table>
                    <tr>
                        <th>구독 ID</th>
                        <th>고객 ID</th>
                        <th>구독제품 시리얼 번호</th>
                        <th>구독 시작일자</th>
                        <th>구독 만료일자</th>
                        <th>상태</th>
                    </tr>
                    <?php while ($row = oci_fetch_assoc($stmtA)): ?>
                    <tr>
                        <td><?= htmlspecialchars($row['SUBSCRIPTION_ID']) ?></td>
                        <td><?= htmlspecialchars($row['CUSTOMER_ID']) ?></td>
                        <td><?= htmlspecialchars($row['SERIAL_NUMBER']) ?></td>
                        <td><?= htmlspecialchars($row['BEGIN_DATE']) ?></td>
                        <td><?= htmlspecialchars($row['EXPIRED_DATE']) ?></td>

                        <td>
                            <?php  
                                if (empty($row['EXPIRED_DATE'])) {
                                    echo '구독대기';
                                } else {  
                                    $expiredDate = DateTime::createFromFormat('Y-m-d H:i:s', $row['EXPIRED_DATE']);                       
                                        $currentDate = new DateTime(); 
                                        if ($expiredDate > $currentDate) {
                                            echo '구독중';
                                        }
                                        else {
                                            echo '구독만료됨';
                                        }
                                    
                                }
                                ?>
                        </td>



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