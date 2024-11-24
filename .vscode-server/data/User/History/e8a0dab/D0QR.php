<?php
require '../../config.php';

$config = require 'config.php';
$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
(HOST={$config['host']})(PORT={$config['port']}))
(CONNECT_DATA=(SID=($config['sid']})))";
$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if(!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: ".htmlspecialchars($e['message'])."</p>";
    exit;
}


?>