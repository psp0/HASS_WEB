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