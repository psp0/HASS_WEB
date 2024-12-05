<?php
require '../../../config.php';

// 응답 헤더를 JSON 형식으로 설정
header('Content-Type: application/json');

// POST로 전달된 데이터 받기
$subscriptionId = $_POST['subscription_id'] ?? null;  
$additionalComment = $_POST['additional_comment'] ?? null;  
$visitDate = $_POST['visit_date'] ?? null;  

if (isset($subscriptionId, $visitDate)) {
    try {
        // 방문일자를 DateTime 객체로 변환 (한국 표준시 기준)
        $submittedDate = DateTime::createFromFormat('Y-m-d\TH:i', $visitDate, new DateTimeZone('Asia/Seoul'));
        if (!$submittedDate) {
            throw new Exception('방문 일자 형식이 잘못되었습니다.');
        }

        // 현재 시각을 한국 표준시 기준으로 가져오기
        $now = new DateTime('now', new DateTimeZone('Asia/Seoul'));
        $minDate = clone $now;
        $minDate->modify('+24 hours');

        // 방문 일자가 현재 시각 기준 24시간 이후인지 확인
        if ($submittedDate < $minDate) {
            throw new Exception('방문 일자는 현재 시각 기준 24시간 이후로 선택해주세요.');
        }

        // 방문 시간이 09:00부터 18:00 사이인지 확인
        $hour = (int)$submittedDate->format('H');
        if ($hour < 9 || $hour >= 18) {
            throw new Exception('방문 시간은 오전 9시부터 오후 6시 사이로 선택해주세요.');
        }

        // 데이터베이스 연결
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
  
        
        // REQUEST 테이블에 삽입
        $RequestQuery = "INSERT INTO REQUEST (REQUEST_ID, REQUEST_TYPE, REQUEST_STATUS, ADDITIONAL_COMMENT, DATE_CREATED, SUBSCRIPTION_ID)
        VALUES (R_SEQ.NEXTVAL, '회수', '대기중', :ADDITIONAL_COMMENT, SYSDATE, :SUBSCRIPTION_ID)";

        $requestStmt = oci_parse($conn, $RequestQuery);
        oci_bind_by_name($requestStmt, ":SUBSCRIPTION_ID", $subscriptionId);
        oci_bind_by_name($requestStmt, ":ADDITIONAL_COMMENT", $additionalComment);          

        if (!oci_execute($requestStmt, OCI_NO_AUTO_COMMIT)) {
            $e = oci_error($requestStmt);
            throw new Exception('REQUEST 테이블 삽입 쿼리 실행 오류: ' . $e['message']);
        }
        oci_free_statement($requestStmt);

        // 방문 일자 삽입
        $formattedVisitDate = $submittedDate->format('Y-m-d H:i:s');

        $insertPreferenceQuery = "INSERT INTO REQUEST_PREFERENCE_DATE (PREFERENCE_ID, PREFER_DATE, REQUEST_ID)
        VALUES (RPD_SEQ.NEXTVAL, TO_DATE(:PREFER_DATE, 'YYYY-MM-DD HH24:MI:SS'), R_SEQ.CURRVAL)";
        $insertPreferenceStmt = oci_parse($conn, $insertPreferenceQuery);
        oci_bind_by_name($insertPreferenceStmt, ':PREFER_DATE', $formattedVisitDate);
        
        if (!oci_execute($insertPreferenceStmt, OCI_NO_AUTO_COMMIT)) {
            $e = oci_error($insertPreferenceStmt);
            throw new Exception('방문 일자 삽입 오류: ' . $e['message']);
        }

        oci_free_statement($insertPreferenceStmt);

        // 트랜잭션 커밋
        if (!oci_commit($conn)) {
            $e = oci_error($conn);
            throw new Exception('트랜잭션 커밋 실패: ' . $e['message']);
        }
            
        // 성공 응답
        echo json_encode(['status' => 'success']);

    } catch (Exception $e) {
        if (isset($conn)) {
            oci_rollback($conn);
        }
        // 오류 응답
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    } finally {
        if (isset($conn)) {
            oci_close($conn);
        }
    }
} else {
    // 필수 항목이 누락된 경우
    echo json_encode(['status' => 'error', 'message' => '필수 항목이 누락되었습니다.']);
}
?>
