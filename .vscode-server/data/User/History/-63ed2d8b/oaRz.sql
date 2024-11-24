<?php
    $config = require '../../config.php';
    $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
        (HOST={$config['host']})(PORT={$config['port']}))
        (CONNECT_DATA=(SID={$config['sid']})))";
    $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

    if (!$conn) {
        $e = oci_error();
        echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
        exit;
    }

    $auth_id = $_POST['id'] ?? '';
    $password = $_POST['password'] ?? '';
    $customer_name = $_POST['name'] ?? '';
    $main_phone = $_POST['main_phone'] ?? '';
    $sub_phone = $_POST['sub_phone'] ?? '';
    $postal_code = $_POST['postal_code'] ?? '';
    $road_address = $_POST['road_address'] ?? '';
    $detail_address = $_POST['detail_address'] ?? '';
    $created_date = date('Y-m-d');
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $queryA = "INSERT INTO CUSTOMER (CUSTOMER_ID, CUSTOMER_NAME, MAIN_PHONE_NUMBER, SUB_PHONE_NUMBER, DATE_CREATED)
                   VALUES (C_SEQ.NEXTVAL, :customer_name, :main_phone, :sub_phone, TO_DATE(:created_date, 'YYYY-MM-DD'))";
    $stmtA = oci_parse($conn, $queryA);

    oci_bind_by_name($stmtA, ':customer_name', $customer_name);
    oci_bind_by_name($stmtA, ':main_phone', $main_phone);
    oci_bind_by_name($stmtA, ':sub_phone', $sub_phone);
    oci_bind_by_name($stmtA, ':created_date', $created_date);

    $queryB = "INSERT INTO CUSTOMER_AUTH(AUTH_ID, PW_HASH) VALUES (:auth_id, :hashed_password)";
    $stmtB = oci_parse($conn, $queryB);

    oci_bind_by_name($stmtB, ':auth_id', $auth_id);
    oci_bind_by_name($stmtB, ':hashed_password', $hashed_password);

    $queryC = "INSERT INTO CUSTOMER_ADDRESS(STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE) VALUES (:road_address, :detail_address, :psotal_code)";
    $stmtC = oci_parse($conn, $queryC);

    oci_bind_by_name($stmtC, ':road_address', $road_address);
    oci_bind_by_name($stmtC, ':detail_address', $detail_address);
    oci_bind_by_name($stmtC, ':postal_code', $postal_code);

    oci_execute($stmtA, OCI_NO_AUTO_COMMIT);
    oci_execute($stmtB, OCI_NO_AUTO_COMMIT);
    oci_execute($stmtC, OCI_NO_AUTO_COMMIT);

    if (oci_commit($conn)) {
        echo "<p class='success'>회원가입이 성공적으로 완료되었습니다!</p>";
        header('Location: pages/login/customer_login.php');
    } else {
        oci_rollback($conn);
        $e = oci_error();
        echo "<p class='error'> 회원가입에 실패하였습니다: " . htmlspecialchars($e['message']) . "</p>";
    }

    oci_free_statement($stmtA);
    oci_free_statement($stmtB);
    oci_free_statement($stmtC);
    oci_close($conn);
    ?>