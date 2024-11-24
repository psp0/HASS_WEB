<?php
$config = require '../../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

// 기본 쿼리: 초기에는 모든 모델 ID 표시
$query = "SELECT MODEL_ID FROM MODEL_AIRCLEANER_SPEC";

// POST 데이터 수신 및 디코딩
$input = json_decode(file_get_contents('php://input'), true);

// 조건에 따른 쿼리 수정 (필터가 있을 때만)
if (!empty($input)) {
    $query .= " WHERE 1=1";
    foreach ($input as $filterType => $values) {
        if (!empty($values)) {
            $values = array_map(function ($val) use ($conn) {
                return "'" . oci_escape_string($val) . "'";
            }, $values);
            $valuesList = implode(',', $values);

            if ($filterType == '필터 종류') {
                $query .= " AND FILTER_TYPE IN ($valuesList)";
            } elseif ($filterType == 'PM 센서') {
                $query .= " AND PM_SENSOR IN ($valuesList)";
            }
            // 다른 필터 조건도 추가 가능
        }
    }
}

// 쿼리 실행 및 결과 출력
$stmt = oci_parse($conn, $query);
oci_execute($stmt);

$output = '<div class="data-container">';
while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
    $output .= "<div class='model-card'><p>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</p></div>";
}

if ($output === '<div class="data-container">') {
    $output .= "<p>조건에 맞는 결과가 없습니다.</p>";
}
$output .= '</div>';

echo $output;

oci_free_statement($stmt);
oci_close($conn);
?>