<?php
$config = require '../../config.php';

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
(HOST={$config['host']})(PORT={$config['port']}))
(CONNECT_DATA=(SID={$config['sid']})))";      
$conn = oci_connect($config['username'], $config['password'], $dsn,'UTF8');

if(!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: ".htmlspecialchars($e['message'])."</p>";
    exit;
}

$id = $_POST('id') ?? '';

if (empty($id)) {
    echo "error";
    exit;
}

$query = "SELECT COUNT(*) AS COUNT FROM CUSTOMER WHERE id = :id";
$stmt = oci_parse($conn, $query);

oci_bind_by_name($stmt,":id", $id);
oci_execute($stmt);

$row = oci_fetch_array($stmt);
if ($row['COUNT'] > 0) {
    echo "exists";
} else {
    echo "availab;e";
}

oci_free_statement($stmt);
oci_close($conn);
?>