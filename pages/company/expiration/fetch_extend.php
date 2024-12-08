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
        oci_free_statement($beginStmt);
        
        // 현재 구독 정보 조회 
        $subscriptionQuery = "SELECT SUBSCRIPTION_YEAR FROM SUBSCRIPTION WHERE SUBSCRIPTION_ID = :SUBSCRIPTION_ID";
        $subscriptionStmt = oci_parse($conn, $subscriptionQuery);
        oci_bind_by_name($subscriptionStmt, ":SUBSCRIPTION_ID", $subscriptionId);

        if (!oci_execute($subscriptionStmt)) {
            throw new Exception('구독 정보 조회 중 오류가 발생했습니다.');
        }

        $row = oci_fetch_assoc($subscriptionStmt);
        if ($row) {
            $prevSubscriptionYear = intval($row['SUBSCRIPTION_YEAR']);
        } else {   
            throw new Exception('해당 구독 정보를 찾을 수 없습니다.');
        }
        oci_free_statement($subscriptionStmt);

        // 유효한 연장 년수인지 확인 (추가 검증)
        $addSubscriptionYear = filter_var($addSubscriptionYear, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1]
        ]);
        if ($addSubscriptionYear === false) {
            throw new Exception('유효한 연장 년수를 입력해 주세요.');
        }

        // 새로운 구독 년수 계산
        $afterSubscriptionYear = $prevSubscriptionYear + intval($addSubscriptionYear);

        // SUBSCRIPTION_YEAR만 업데이트
        $updateSubscriptionQuery = "UPDATE SUBSCRIPTION 
                                    SET SUBSCRIPTION_YEAR = :SUBSCRIPTION_YEAR 
                                    WHERE SUBSCRIPTION_ID = :SUBSCRIPTION_ID";
        $updateSubscriptionStmt = oci_parse($conn, $updateSubscriptionQuery);
        
        oci_bind_by_name($updateSubscriptionStmt, ':SUBSCRIPTION_ID', $subscriptionId);
        oci_bind_by_name($updateSubscriptionStmt, ':SUBSCRIPTION_YEAR', $afterSubscriptionYear);
        
        // UPDATE 쿼리 실행 (OCI_NO_AUTO_COMMIT 사용)
        if (!oci_execute($updateSubscriptionStmt, OCI_NO_AUTO_COMMIT)) {
            $e = oci_error($updateSubscriptionStmt);
            throw new Exception('구독 년수 업데이트 쿼리 실행 오류: ' . $e['message']);
        }
        oci_free_statement($updateSubscriptionStmt);

        // 트랜잭션 커밋
        if (!oci_commit($conn)) {
            $e = oci_error($conn);
            throw new Exception('트랜잭션 커밋 실패: ' . $e['message']);
        }
        
        // 성공적으로 업데이트된 후 페이지 리다이렉트
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
    // 필수 파라미터가 없는 경우 에러 메시지 출력
    echo "<p class='error'>선택항목을 선택해주십시오.</p>";
}
?>
