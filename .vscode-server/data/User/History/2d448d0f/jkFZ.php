<?php
require 'config.php'; // 데이터베이스 설정 파일 포함

// 데이터베이스 연결 설정
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}

// 모델 ID 설정
$model_id = 3;

// 리뷰 데이터를 가져오는 SQL 쿼리
$query = "
    SELECT 
        MR.RATING, 
        MR.ADDITIONAL_COMMENT, 
        MR.DATE_CREATED, 
        MR.DATE_EDITED, 
        C.CUSTOMER_NAME
    FROM CUSTOMER C
    JOIN SUBSCRIPTION S ON C.CUSTOMER_ID = S.CUSTOMER_ID
    JOIN MODEL_RATING MR ON S.SUBSCRIPTION_ID = MR.SUBSCRIPTION_ID
    WHERE S.MODEL_ID = :model_id
";

// SQL 준비 및 바인드 변수 설정
$stmt = oci_parse($conn, $query);
oci_bind_by_name($stmt, ':model_id', $model_id);

// SQL 실행
oci_execute($stmt);

// HTML 헤더
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>모델 리뷰</title>
    <style>
        .data-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .data-row {
            margin-bottom: 20px;
            padding: 10px;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .data-field {
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            color: #333;
        }
        .value {
            color: #555;
        }
    </style>
</head>
<body>
<div class="data-container">
    <h1>모델 리뷰</h1>
    <?php 
    // 데이터 출력
    while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
        echo "<div class='data-row'>";
        echo "<div class='data-field'><span class='label'>별점:</span> <span class='value'>" . htmlspecialchars($row['RATING']) . "</span></div>";
        echo "<div class='data-field'><span class='label'>댓글:</span> <span class='value'>" . htmlspecialchars($row['ADDITIONAL_COMMENT']) . "</span></div>";
        echo "<div class='data-field'><span class='label'>작성일:</span> <span class='value'>" . htmlspecialchars($row['DATE_CREATED']) . "</span></div>";
        echo "<div class='data-field'><span class='label'>수정일:</span> <span class='value'>" . htmlspecialchars($row['DATE_EDITED']) . "</span></div>";
        echo "<div class='data-field'><span class='label'>작성자:</span> <span class='value'>" . htmlspecialchars($row['CUSTOMER_NAME']) . "</span></div>";
        echo "</div>";
    }
    ?>
</div>
<?php
// 리소스 해제
oci_free_statement($stmt);
oci_close($conn);
?>
</body>
</html>
