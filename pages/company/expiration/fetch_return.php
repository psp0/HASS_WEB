<?php
require '../../../config.php';

// POST로 전달된 데이터 받기
$subscriptionId = $_POST['subscription_id'] ?? null;  
$additionalComment = $_POST['additional_comment'] ?? null;  
$visitDate = $_POST['visit_date'] ?? null;  

if (isset($subscriptionId, $visitDate)) {
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
  
        $RequestQuery = "INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, SUBSCRIPTION_ID)
        VALUES (R_SEQ.NEXTVAL, '회수', '대기중', :ADDITIONAL_COMMENT, SYSDATE, :SUBSCRIPTION_ID)";

        

          $requestStmt = oci_parse($conn, $RequestQuery);
          oci_bind_by_name($requestStmt, ":SUBSCRIPTION_ID", $subscriptionId);
          oci_bind_by_name($requestStmt, ":ADDITIONAL_COMMENT", $additionalComment);          
          
          if (!oci_execute($requestStmt, OCI_NO_AUTO_COMMIT)) {
              $e = oci_error($requestStmt);
              throw new Exception('request 테이블 삽입 쿼리 실행 오류: ' . $e['message']);
          }
          oci_free_statement($requestStmt);
        

    
       
              $formattedVisitDate = DateTime::createFromFormat('Y-m-d\TH:i', $visitDate);
              if (!$formattedVisitDate) {
                  throw new Exception('방문 일자 형식이 잘못되었습니다.');
              }
          
          
            $formattedVisitDate = $formattedVisitDate->format('Y-m-d H:i:s');

          $insertPreferenceQuery = "INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, PREFER_DATE, REQUEST_ID)
          VALUES (RPD_SEQ.NEXTVAL, TO_DATE(:PREFER_DATE, 'YYYY-MM-DD HH24:MI:SS'), R_SEQ.CURRVAL)";
$insertPreferenceStmt = oci_parse($conn, $insertPreferenceQuery);
oci_bind_by_name($insertPreferenceStmt, ':PREFER_DATE', $formattedVisitDate);

if (!oci_execute($insertPreferenceStmt, OCI_NO_AUTO_COMMIT)) {
$e = oci_error($insertPreferenceStmt);
throw new Exception('방문 일자 삽입 오류: ' . $e['message']);
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