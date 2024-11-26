<?php
session_start();
session_unset(); 
session_destroy(); 

$redirect_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '/index.php'; 
header("Location: $redirect_url");
echo "<script>alert('로그아웃 되었습니다. 감사합니다!');</script>";
echo "<script>location.href='../../index.php';</script>";
exit;
?>