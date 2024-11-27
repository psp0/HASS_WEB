<?php
$config = require '../../../config.php';
header('Content-Type: application/json');


set_error_handler(function ($errno, $errstr, $errfile, $errline) {
  echo json_encode(['success' => false, 'message' => "PHP Error: $errstr in $errfile on line $errline"]);
  exit;
});

set_exception_handler(function ($exception) {
  echo json_encode(['success' => false, 'message' => $exception->getMessage()]);
  exit;
});

try {

  if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    throw new Exception('로그인이 필요합니다.');
  }


  if (!isset($_SESSION['customer_id'])) {
    throw new Exception('고객 ID가 설정되지 않았습니다.');
  }
  $customerId = $_SESSION['customer_id'];


  $data = json_decode(file_get_contents('php://input'), true);

  if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception('JSON 데이터 디코딩 실패: ' . json_last_error_msg());
  }


  $visitDate1 = isset($data['visit_date_1']) ? str_replace('T', ' ', $data['visit_date_1']) : null;
  $visitDate2 = isset($data['visit_date_2']) ? str_replace('T', ' ', $data['visit_date_2']) : null;
  $subscriptionPeriod = $data['subscription_period'] ?? null;
  $additionalRequest = $data['additional_request'] ?? '';
  $modelId = $data['model_id'] ?? null;


  if (!$modelId || !$visitDate1 || !$visitDate2 || !$subscriptionPeriod) {
    throw new Exception('필수 정보가 누락되었습니다.');
  }


  if (strlen($additionalRequest) > 1000) {
    throw new Exception('요청사항은 최대 1000자까지 입력 가능합니다.');
  }


  $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
  $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

  if (!$conn) {
    $e = oci_error();
    throw new Exception('데이터베이스 연결 실패: ' . $e['message']);
  }

  // 트랜잭션 시작
  $beginStmt = oci_parse($conn, 'BEGIN NULL; END;');
  if (!oci_execute($beginStmt, OCI_NO_AUTO_COMMIT)) {
    throw new Exception('트랜잭션 시작 실패');
  }

  // 재고 있는 제품 조회
  $productQuery = "SELECT SERIAL_NUMBER FROM PRODUCT WHERE MODEL_ID = :model_id AND PRODUCT_STATUS = '재고' AND ROWNUM = 1";
  $productStmt = oci_parse($conn, $productQuery);
  oci_bind_by_name($productStmt, ':model_id', $modelId);

  if (!oci_execute($productStmt)) {
    $e = oci_error($productStmt);
    throw new Exception('재고 조회 쿼리 실행 오류: ' . $e['message']);
  }

  $productRow = oci_fetch_assoc($productStmt);
  if (!$productRow) {
    throw new Exception('해당 모델의 재고가 없습니다.');
  }

  $serialNumber = $productRow['SERIAL_NUMBER'];

  // 제품 상태 업데이트 ('재고' -> '구독대기')
  $updateProductQuery = "UPDATE PRODUCT SET PRODUCT_STATUS = '구독대기' WHERE SERIAL_NUMBER = :serial_number";
  $updateProductStmt = oci_parse($conn, $updateProductQuery);
  oci_bind_by_name($updateProductStmt, ':serial_number', $serialNumber);
  if (!oci_execute($updateProductStmt, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($updateProductStmt);
    throw new Exception('제품 상태 업데이트 쿼리 실행 오류: ' . $e['message']);
  }

  // SUBSCRIPTION 테이블에 데이터 삽입
  $insertSubscriptionQuery = "INSERT INTO SUBSCRIPTION (SUBSCRIPTION_ID, SUBSCRIPTION_YEAR, DATE_CREATED, CUSTOMER_ID, SERIAL_NUMBER)
                                VALUES (S_SEQ.NEXTVAL, :subscription_year, SYSDATE, :customer_id, :serial_number)";
  $insertSubscriptionStmt = oci_parse($conn, $insertSubscriptionQuery);
  oci_bind_by_name($insertSubscriptionStmt, ':subscription_year', $subscriptionPeriod);
  oci_bind_by_name($insertSubscriptionStmt, ':customer_id', $customerId);
  oci_bind_by_name($insertSubscriptionStmt, ':serial_number', $serialNumber);
  if (!oci_execute($insertSubscriptionStmt, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($insertSubscriptionStmt);
    throw new Exception('SUBSCRIPTION 테이블 삽입 쿼리 실행 오류: ' . $e['message']);
  }

  // SUBSCRIPTION_ID 가져오기
  $subscriptionIdStmt = oci_parse($conn, "SELECT S_SEQ.CURRVAL AS LAST_SUBSCRIPTION_ID FROM DUAL");
  if (!oci_execute($subscriptionIdStmt)) {
    $e = oci_error($subscriptionIdStmt);
    throw new Exception('SUBSCRIPTION_ID 가져오기 실패: ' . $e['message']);
  }
  $subscriptionId = oci_fetch_assoc($subscriptionIdStmt)['LAST_SUBSCRIPTION_ID'];

  // REQUEST 테이블에 데이터 삽입
  $insertRequestQuery = "INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, SUBSCRIPTION_ID)
                           VALUES (R_SEQ.NEXTVAL, '설치', '대기중', :additional_comment, SYSDATE, :subscription_id)";
  $insertRequestStmt = oci_parse($conn, $insertRequestQuery);
  oci_bind_by_name($insertRequestStmt, ':additional_comment', $additionalRequest);
  oci_bind_by_name($insertRequestStmt, ':subscription_id', $subscriptionId);
  if (!oci_execute($insertRequestStmt, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($insertRequestStmt);
    throw new Exception('REQUEST 테이블 삽입 쿼리 실행 오류: ' . $e['message']);
  }

  // REQUEST_ID 가져오기
  $requestIdStmt = oci_parse($conn, "SELECT R_SEQ.CURRVAL AS LAST_REQUEST_ID FROM DUAL");
  if (!oci_execute($requestIdStmt)) {
    $e = oci_error($requestIdStmt);
    throw new Exception('REQUEST_ID 가져오기 실패: ' . $e['message']);
  }
  $requestId = oci_fetch_assoc($requestIdStmt)['LAST_REQUEST_ID'];

  // REQUEST_PREFERENCE_DATE 테이블에 선호 방문 일자 삽입
  $insertPreferenceQuery = "INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, PREFER_DATE, REQUEST_ID)
                              VALUES (RPD_SEQ.NEXTVAL, TO_DATE(:prefer_date, 'YYYY-MM-DD HH24:MI'), :request_id)";
  $insertPreferenceStmt = oci_parse($conn, $insertPreferenceQuery);

  // 첫 번째 선호 방문 일자
  oci_bind_by_name($insertPreferenceStmt, ':prefer_date', $visitDate1);
  oci_bind_by_name($insertPreferenceStmt, ':request_id', $requestId);
  if (!oci_execute($insertPreferenceStmt, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($insertPreferenceStmt);
    throw new Exception('첫 번째 선호 방문 일자 삽입 오류: ' . $e['message']);
  }

  // 두 번째 선호 방문 일자
  oci_bind_by_name($insertPreferenceStmt, ':prefer_date', $visitDate2);
  oci_bind_by_name($insertPreferenceStmt, ':request_id', $requestId);
  if (!oci_execute($insertPreferenceStmt, OCI_NO_AUTO_COMMIT)) {
    $e = oci_error($insertPreferenceStmt);
    throw new Exception('두 번째 선호 방문 일자 삽입 오류: ' . $e['message']);
  }

  // 트랜잭션 커밋
  if (!oci_commit($conn)) {
    $e = oci_error($conn);
    throw new Exception('트랜잭션 커밋 실패: ' . $e['message']);
  }

  echo json_encode(['success' => true]);
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
?>