<?php
require '../../config.php';

$config = require '../../config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "error";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo "error";
        exit;
    }

    $query = "SELECT COUNT(*) AS count FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
    $stmt = oci_parse($conn, $query);

    oci_bind_by_name($stmt, ':auth_id', $id);

    oci_execute($stmt);

    $row = oci_fetch_array($stmt);

    if ($row['COUNT'] > 0) {
        echo "exists"; // 이미 존재하는 ID
    } else {
        echo "available"; // 사용 가능한 ID
    }

    oci_free_statement($stmt);
    oci_close($conn);
} else {
    echo "error";
    exit;
}
?>
