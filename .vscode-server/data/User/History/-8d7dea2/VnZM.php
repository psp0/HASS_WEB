<?php
$pw6 = password_hash('password_6', PASSWORD_BCRYPT);
$pw7 = password_hash('password_7', PASSWORD_BCRYPT);

echo "6번 고객 해시: $pw6\n";
echo "7번 고객 해시: $pw7\n";
?>
