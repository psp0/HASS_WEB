<?php
require '../../../config.php';

// POST로 전달된 데이터 받기
$problem_detail = $_POST['problem_detail'] ?? null;
$solution_detail = $_POST['solution_detail'] ?? null;
$requestId = $_POST['request_id'] ?? null;  

if (isset($requestId)) {
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
        
        if(isset($problem_detail, $solution_detail)){

$visitIdQuery = "SELECT VISIT_ID FROM VISIT WHERE REQUEST_ID =:REQUEST_ID";
$visitIdStmt = oci_parse($conn, $visitIdQuery);

oci_bind_by_name($visitIdStmt, ":REQUEST_ID", $requestId);

oci_execute($visitIdStmt);
$visitId = oci_fetch_assoc($visitIdStmt)['VISIT_ID'];


          $visitRepairQuery = "INSERT INTO VISIT_REPAIR (VISIT_ID, PROBLEM_DETAIL, SOLUTION_DETAIL)
              VALUES ( :VISIT_ID,:PROBLEM_DETAIL, :SOLUTION_DETAIL)";
          
          $stmtVisitRepair = oci_parse($conn, $visitRepairQuery);
          oci_bind_by_name($stmtVisitRepair, ":PROBLEM_DETAIL", $problem_detail);
          oci_bind_by_name($stmtVisitRepair, ":SOLUTION_DETAIL", $solution_detail);
          oci_bind_by_name($stmtVisitRepair, ":VISIT_ID", $visitId);
          
          if (!oci_execute($stmtVisitRepair, OCI_NO_AUTO_COMMIT)) {
              $e = oci_error($stmtVisitRepair);
              throw new Exception('visit repair 테이블 삽입 쿼리 실행 오류: ' . $e['message']);
          }
          oci_free_statement($stmtVisitRepair);
        }

  
    $updateRequestQuery = "UPDATE REQUEST SET  REQUEST_STATUS = '방문완료' WHERE REQUEST_ID = :REQUEST_ID";
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
