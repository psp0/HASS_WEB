<?php
require '../../../config.php';

// POST로 전달된 데이터 받기
$workerId = $_POST['special_worker'] ?? null;
$visitDate = $_POST['visit_date'] ?? null;
$requestId = $_POST['request_id'] ?? null;  

if (isset($workerId, $visitDate, $requestId)) {
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

        $formattedVisitDate = DateTime::createFromFormat('y.m.d H:i', $visitDate)->format('Y-m-d H:i:s');

        // 쿼리 수정 (TO_DATE 함수 사용)
        $visitQuery = "INSERT INTO VISIT (VISIT_ID, VISIT_DATE, DATE_CREATED, WORKER_ID, REQUEST_ID)
            VALUES (V_SEQ.NEXTVAL, TO_DATE(:VISIT_DATE, 'YYYY-MM-DD HH24:MI:SS'), SYSDATE, :WORKER_ID, :REQUEST_ID)";
        
        $stmtVisit = oci_parse($conn, $visitQuery);
        oci_bind_by_name($stmtVisit, ":VISIT_DATE", $formattedVisitDate);
        oci_bind_by_name($stmtVisit, ":WORKER_ID", $workerId);
        oci_bind_by_name($stmtVisit, ":REQUEST_ID", $requestId);
        
        if (!oci_execute($stmtVisit, OCI_NO_AUTO_COMMIT)) {
            $e = oci_error($stmtVisit);
            throw new Exception('visit 테이블 삽입 쿼리 실행 오류: ' . $e['message']);
        }

    oci_free_statement($stmtVisit);
  
    $updateRequestQuery = "UPDATE REQUEST SET  REQUEST_STATUS = '방문예정' WHERE REQUEST_ID = :REQUEST_ID";
    $updateRequestStmt = oci_parse($conn, $updateRequestQuery);
    oci_bind_by_name($updateRequestStmt, ':REQUEST_ID', $requestId);
    
    if (!oci_execute($updateRequestStmt, OCI_NO_AUTO_COMMIT)) {
      $e = oci_error($updateRequestStmt);
      throw new Exception('요청 상태 업데이트 쿼리 실행 오류: ' . $e['message']);
    }
    
    // 트랜잭션 커밋
    if (!oci_commit($conn)) {
      $e = oci_error($conn);
      throw new Exception('트랜잭션 커밋 실패: ' . $e['message']);
    }
      
    echo "<script>location.href='request.php';</script>";

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

