<div class="data-container">
    <?php     
    $config = require 'config.php'; 
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";      
    $conn = oci_connect($config['username'], $config['password'], $dsn,'UTF8');

    if (!$conn) {
        $e = oci_error();
        echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
        exit;
    }

    $query = "SELECT * FROM WORKER";
    $stmt = oci_parse($conn, $query);
    oci_execute($stmt);

    while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
        echo "<div class='data-row'>";
        foreach ($row as $column => $value) {
            echo "<div class='data-field'><span class='label'>" . htmlspecialchars($column) . "은(는)</span> <span class='value'>" . htmlspecialchars($value) . "</span></div>";
        }
        echo "</div>";
    }

    // 리소스 해제
    oci_free_statement($stmt);
    oci_close($conn);
    ?>
</div>

<?php
// 확인하려는 텍스트
$plaintext = 'its_me!'; // 텍스트를 여기에 입력하세요

// 주어진 bcrypt 해시값
$hash = '$2b$12$5p2Vz2j7o/Ov.m1o9L415O9AIz1IMVMydumsZiyA2KYcwsPdiAsYy';

// bcrypt 해시값과 텍스트 비교
if (password_verify($plaintext, $hash)) {
    echo "텍스트가 해시값과 일치합니다.";
} else {
    echo "텍스트가 해시값과 일치하지 않습니다.";
}
?>