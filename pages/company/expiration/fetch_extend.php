<?php
require '../../../config.php';

// POST로 전달된 데이터 받기
$subscriptionId = $_POST['subscriptionId'] ?? null;  
$addSubscriptionYear = $_POST['extension_years'] ?? null;  

if (isset($subscriptionId,$addSubscriptionYear)) {
    try {
        // if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        //   throw new Exception('로그인이 필요합니다.');
        // }
        
        $config = require '../../../config.php'; 
        $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
        $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');
        
        if (!$conn) {
            $e = oci_error();
            throw new Exception('데이터베이스 연결 실패: ' . $e['message']);
        }

        // 트랜잭션 시작
        $beginStmt = oci_parse($conn, 'BEGIN NULL; END;');
        if (!oci_execute($beginStmt, OCI_NO_AUTO_COMMIT)) {
            throw new Exception(message: '트랜잭션 시작 실패');
        }
        
$expiredDateQuery = "SELECT SUBSCRIPTION_YEAR,EXPIRED_DATE FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID =:SUBSCRIPTION_ID";
$expiredDateStmt = oci_parse($conn, $expiredDateQuery);
oci_bind_by_name($expiredDateStmt, ":SUBSCRIPTION_ID", $subscriptionId);
oci_execute($expiredDateStmt);
$row = oci_fetch_assoc($expiredDateStmt);
if ($row) {
    $expiredDate = $row['EXPIRED_DATE'];
    $prevSubscriptionYear = $row['SUBSCRIPTION_YEAR'];
} else {   
    $expiredDate = null;
    $prevSubscriptionYear = null;
}

$afterSubscriptionYear = intval($prevSubscriptionYear)+ intval($addSubscriptionYear);
$expiredDate = $row['EXPIRED_DATE'];
$expiredDateTime = new DateTime($expiredDate);
$expiredDateTime->modify('+' . intval($addSubscriptionYear) . ' years');
$afterSubscriptionDate = $expiredDateTime->format('Y-m-d H:i:s');



$updateSubscriptionQuery = "UPDATE SUBSCRIPTION 
                            SET SUBSCRIPTION_YEAR = :SUBSCRIPTION_YEAR, 
                                EXPIRED_DATE = TO_DATE(:EXPIRED_DATE, 'YYYY-MM-DD HH24:MI:SS') 
                            WHERE SUBSCRIPTION_ID = :SUBSCRIPTION_ID";
$updateSubscriptionStmt = oci_parse($conn, $updateSubscriptionQuery);

oci_bind_by_name($updateSubscriptionStmt, ':SUBSCRIPTION_ID', $subscriptionId);
oci_bind_by_name($updateSubscriptionStmt, ':SUBSCRIPTION_YEAR', $afterSubscriptionYear);
oci_bind_by_name($updateSubscriptionStmt, ':EXPIRED_DATE', $afterSubscriptionDate);

oci_execute($updateSubscriptionStmt);

    if (!oci_execute($updateSubscriptionStmt, OCI_NO_AUTO_COMMIT)) {
      $e = oci_error($updateSubscriptionStmt);
      throw new Exception('구독 년수 업데이트 쿼리 실행 오류: ' . $e['message']);
    }
    
    // 트랜잭션 커밋
    if (!oci_commit($conn)) {
      $e = oci_error($conn);
      throw new Exception('트랜잭션 커밋 실패: ' . $e['message']);
    }
        
    echo "<script>location.href='expiration.php';</script>";

  


    } catch (Exception $e) {
    if (isset($conn)) {
      oci_rollback($conn);
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    } finally {
    if (isset($conn)) {
      oci_close($conn);
    }
    }
  } else {
    echo "<p class='error'>선택항목을 선택해주십시오.</p>";
  }
?>