<?php
session_start();
require '../../../config.php';

$config = require '../../../config.php'; 
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))";  
$conn = oci_connect($config['username'], $config['password'], $dsn,'UTF8');
        
if(!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: ".htmlspecialchars($e['message'])."</p>";
    exit;
}

$customer_id = $_SESSION['customer_id'];

try {
    $queryA = "SELECT 
                    CASE
                        WHEN EXPIRED_DATE < SYSDATE THEN 'Expired'
                        ELSE 'Subscribed'
                    END AS SUBSCRIPTION_STATUS
                FROM SUBSCRIPTION
                WHERE CUSTOMER_ID = :customer_id";
    $stmtA = oci_parse($conn, $queryA);
    oci_bind_by_name($stmtA, ':customer_id', $customer_id);

    if (!oci_execute($stmtA)) {
        throw new Exception('구독 상태 확인 중 오류가 발생했습니다.');
    }

    $row = oci_fetch_array($stmtA);
    if ($row['SUBSCRIPTION_STATUS'] === 'Expired') {
        $queryB = "DELETE FROM CUSTOMER WHERE CUSTOMER_ID = :customer_id";
        $stmtB = oci_parse($conn, $queryB);
        oci_bind_by_name($stmtB, ':customer_id', $customer_id);

        if (oci_execute($stmtB)) {
            oci_commit($conn);
            session_unset();
            session_destroy();
            echo json_encode([
                'status' => 'success',
                'message' => '회원탈퇴가 정상적으로 처리되었습니다.'
            ]);
        } else {
            oci_rollback($conn);
            throw new Exception('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => '현재 구독이 만료되지 않았습니다.'
        ]);
        exit;
    }
} catch (Exception $e) {
    oci_rollback($conn);
    echo json_encode(['status' => 'error', 'message' => '예외 발생: ' . $e->getMessage()]);
}
oci_free_statement($stmtA);
oci_free_statement($stmtB);
oci_close($conn);
?>