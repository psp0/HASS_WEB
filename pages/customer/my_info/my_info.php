<?php
$config = require '../../../config.php';
include BASE_PATH . '/includes/customer_header.php';
?>

<link rel="stylesheet" href="./my_info.css">

<?php

$dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)
    (HOST={$config['host']})(PORT={$config['port']}))
    (CONNECT_DATA=(SID={$config['sid']})))";

$conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

if (!$conn) {
    $e = oci_error();
    echo "<p class='error'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
    exit;
}


if (!isset($_SESSION['auth_id']) || empty($_SESSION['auth_id'])) {
    echo "<script>alert('로그인이 필요합니다.');</script>";
    echo "<script>location.href='" . TEAM_PATH . "/pages/login/customer_login.php';</script>";
    exit;
}
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'customer') {
    echo "<script>alert('고객 전용 페이지 입니다. 고객 로그인을 해주세요.');</script>";
    echo "<script>location.href='" . TEAM_PATH . "/pages/login/customer_login.php';</script>";
    exit;
}

$currentUserID = $_SESSION['auth_id'];
$customer_name = '';
$main_phone_number = '';
$sub_phone_number = '';
$street_address = '';
$detail_address = '';
$postal_code = '';

// 고객 정보 가져오기
$queryA = "SELECT c.CUSTOMER_NAME, c.MAIN_PHONE_NUMBER, c.SUB_PHONE_NUMBER
           FROM CUSTOMER c
           JOIN CUSTOMER_AUTH ca ON c.CUSTOMER_ID = ca.CUSTOMER_ID
           WHERE ca.AUTH_ID = :auth_id";
$stmtA = oci_parse($conn, $queryA);
oci_bind_by_name($stmtA, ':auth_id', $currentUserID);

if (oci_execute($stmtA)) {
    $row = oci_fetch_array($stmtA, OCI_ASSOC);
    if ($row) {
        $customer_name = $row['CUSTOMER_NAME'];
        $main_phone_number = $row['MAIN_PHONE_NUMBER'];
        $sub_phone_number = $row['SUB_PHONE_NUMBER'];
    }
} else {
    $e = oci_error($stmtA);
    die("<p class='error'>고객 정보 가져오기 실패: " . htmlspecialchars($e['message']) . "</p>");
}

// 주소 정보 가져오기
$queryB = "SELECT STREET_ADDRESS, DETAILED_ADDRESS, POSTAL_CODE
           FROM CUSTOMER_ADDRESS
           WHERE CUSTOMER_ID = (SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id)";
$stmtB = oci_parse($conn, $queryB);
oci_bind_by_name($stmtB, ':auth_id', $currentUserID);

if (oci_execute($stmtB)) {
    $row = oci_fetch_array($stmtB, OCI_ASSOC);
    if ($row) {
        $street_address = $row['STREET_ADDRESS'];
        $detail_address = $row['DETAILED_ADDRESS'];
        $postal_code = $row['POSTAL_CODE'];
    }
} else {
    $e = oci_error($stmtB);
    die("<p class='error'>주소 정보 가져오기 실패: " . htmlspecialchars($e['message']) . "</p>");
}

// CUSTOMER_ID 가져오기
$queryCustomerID = "SELECT CUSTOMER_ID FROM CUSTOMER_AUTH WHERE AUTH_ID = :auth_id";
$stmtCustomerID = oci_parse($conn, $queryCustomerID);
oci_bind_by_name($stmtCustomerID, ':auth_id', $currentUserID);
oci_execute($stmtCustomerID);
$row = oci_fetch_array($stmtCustomerID, OCI_ASSOC);
$customer_id = $row['CUSTOMER_ID'] ?? null;
oci_free_statement($stmtCustomerID);

if (!$customer_id) {
    die("<p class='error'>고객 ID를 찾을 수 없습니다.</p>");
}

// 구독 정보 가져오기
$sub_info_query = "
SELECT s.SUBSCRIPTION_ID,
       TO_CHAR(s.BEGIN_DATE, 'YYYY-MM-DD HH24:MI:SS') AS BEGIN_DATE,
       TO_CHAR(s.EXPIRED_DATE, 'YYYY-MM-DD HH24:MI:SS') AS EXPIRED_DATE,
       p.SERIAL_NUMBER, m.MODEL_ID, m.MODEL_NAME, m.YEARLY_FEE
FROM SUBSCRIPTION s
JOIN PRODUCT p ON s.SERIAL_NUMBER = p.SERIAL_NUMBER
JOIN MODEL m ON p.MODEL_ID = m.MODEL_ID
JOIN REQUEST R ON s.SUBSCRIPTION_ID = R.SUBSCRIPTION_ID
WHERE s.CUSTOMER_ID = :customer_id AND R.REQUEST_TYPE = '설치'
  AND R.REQUEST_STATUS = '방문완료'
";

$stid = oci_parse($conn, $sub_info_query);
oci_bind_by_name($stid, ':customer_id', $customer_id);
oci_execute($stid);

$current_subscriptions = [];
$expired_subscriptions = [];
$current_date = new DateTime();

while ($row = oci_fetch_assoc($stid)) {
    $beginDate = $row['BEGIN_DATE'] ?? null;
    $expired_date = DateTime::createFromFormat('Y-m-d H:i:s', $row['EXPIRED_DATE']);

    if (is_null($beginDate)) {
        continue;
    }

    // 진행 중인 수리 요청 확인
    $subscription_id = $row['SUBSCRIPTION_ID'];
    $request_check_query = "
    SELECT REQUEST_ID FROM REQUEST
    WHERE SUBSCRIPTION_ID = :subscription_id AND TRIM(REQUEST_STATUS) != '방문완료'
    ";
    $request_check_stmt = oci_parse($conn, $request_check_query);
    oci_bind_by_name($request_check_stmt, ':subscription_id', $subscription_id);
    oci_execute($request_check_stmt);
    $has_ongoing_request = oci_fetch_assoc($request_check_stmt) ? true : false;
    oci_free_statement($request_check_stmt);

    $row['HAS_ONGOING_REQUEST'] = $has_ongoing_request;

    if ($expired_date >= $current_date) {
        $current_subscriptions[] = $row;
    } else {
        $expired_subscriptions[] = $row;
    }
}

// 각 모델에 대한 리뷰 존재 여부 확인
$existing_reviews = [];
$review_query = "
SELECT MODEL_ID, RATING, ADDITIONAL_COMMENT
FROM MODEL_RATING
WHERE CUSTOMER_ID = :customer_id
";
$review_stmt = oci_parse($conn, $review_query);
oci_bind_by_name($review_stmt, ':customer_id', $customer_id);
oci_execute($review_stmt);

while ($row = oci_fetch_assoc($review_stmt)) {
    $existing_reviews[$row['MODEL_ID']] = [
        'RATING' => $row['RATING'],
        'ADDITIONAL_COMMENT' => $row['ADDITIONAL_COMMENT']
    ];
}

oci_free_statement($stid);
oci_free_statement($stmtA);
oci_free_statement($stmtB);
oci_free_statement($review_stmt);



// 진행 중인 요청 가져오기 (REQUEST_STATUS가 '방문완료'가 아닌 것) 
$ongoing_requests_query = "
    SELECT 
        r.REQUEST_ID,
        r.REQUEST_TYPE,
        r.REQUEST_STATUS,
        r.ADDITIONAL_COMMENT,
        TO_CHAR(r.DATE_CREATED, 'YYYY-MM-DD HH24:MI:SS') AS DATE_CREATED,
        TO_CHAR(r.DATE_EDITED, 'YYYY-MM-DD HH24:MI:SS') AS DATE_EDITED,
        r.SUBSCRIPTION_ID,
        TO_CHAR(v.VISIT_DATE, 'YYYY-MM-DD HH24:MI:SS') AS VISIT_DATE
    FROM 
        REQUEST r
    LEFT JOIN VISIT v ON r.REQUEST_ID = v.REQUEST_ID
    WHERE 
        r.SUBSCRIPTION_ID IN (
            SELECT SUBSCRIPTION_ID FROM SUBSCRIPTION WHERE CUSTOMER_ID = :customer_id
        )
        AND TRIM(r.REQUEST_STATUS) != '방문완료'
";
$stmt_ongoing_requests = oci_parse($conn, $ongoing_requests_query);
oci_bind_by_name($stmt_ongoing_requests, ':customer_id', $customer_id);
oci_execute($stmt_ongoing_requests);

$ongoing_requests = [];

while ($row = oci_fetch_assoc($stmt_ongoing_requests)) {
    $ongoing_requests[] = $row;
}
oci_free_statement($stmt_ongoing_requests);

// 만료된 요청 가져오기 (REQUEST_STATUS가 '방문완료'인 것)
$expired_requests_query = "
    SELECT 
        r.REQUEST_ID,
        r.REQUEST_TYPE,
        r.REQUEST_STATUS,
        r.ADDITIONAL_COMMENT,
        TO_CHAR(r.DATE_CREATED, 'YYYY-MM-DD HH24:MI:SS') AS DATE_CREATED,
        TO_CHAR(r.DATE_EDITED, 'YYYY-MM-DD HH24:MI:SS') AS DATE_EDITED,
        r.SUBSCRIPTION_ID,
        TO_CHAR(v.VISIT_DATE, 'YYYY-MM-DD HH24:MI:SS') AS VISIT_DATE
    FROM 
        REQUEST r
    LEFT JOIN VISIT v ON r.REQUEST_ID = v.REQUEST_ID
    WHERE 
        r.SUBSCRIPTION_ID IN (
            SELECT SUBSCRIPTION_ID FROM SUBSCRIPTION WHERE CUSTOMER_ID = :customer_id
        )
        AND TRIM(r.REQUEST_STATUS) = '방문완료'
";
$stmt_expired_requests = oci_parse($conn, $expired_requests_query);
oci_bind_by_name($stmt_expired_requests, ':customer_id', $customer_id);
oci_execute($stmt_expired_requests);

$expired_requests = [];

while ($row = oci_fetch_assoc($stmt_expired_requests)) {
    $expired_requests[] = $row;
}
oci_free_statement($stmt_expired_requests);

// 관련된 SUBSCRIPTION 정보 가져오기 (요청용)
$subscription_ids_ongoing = array_column($ongoing_requests, 'SUBSCRIPTION_ID');
$subscription_ids_expired = array_column($expired_requests, 'SUBSCRIPTION_ID');


$unique_subscription_ids = array_unique(array_merge($subscription_ids_ongoing, $subscription_ids_expired));

if (!empty($unique_subscription_ids)) {
    $subscription_ids_str = implode(',', array_map('intval', $unique_subscription_ids));

    $subscription_info_query = "
        SELECT SUBSCRIPTION_ID, SERIAL_NUMBER 
        FROM SUBSCRIPTION 
        WHERE SUBSCRIPTION_ID IN ($subscription_ids_str)
    ";
    $stmt_sub_info_requests = oci_parse($conn, $subscription_info_query);
    oci_execute($stmt_sub_info_requests);

    $subscription_info_requests = [];

    while ($row = oci_fetch_assoc($stmt_sub_info_requests)) {
        $subscription_info_requests[$row['SUBSCRIPTION_ID']] = $row['SERIAL_NUMBER'];
    }
    oci_free_statement($stmt_sub_info_requests);
} else {
    $subscription_info_requests = [];
}

// 관련된 PRODUCT 정보 가져오기 (요청용)
$serial_numbers_requests = array_unique(array_values($subscription_info_requests));

if (!empty($serial_numbers_requests)) {
    $quoted_serial_numbers_requests = array_map(function ($sn) {
        return "'" . strtoupper(addslashes($sn)) . "'";
    }, $serial_numbers_requests);
    $serial_numbers_str_requests = implode(',', $quoted_serial_numbers_requests);

    $products_query_requests = "
        SELECT SERIAL_NUMBER, MODEL_ID 
        FROM PRODUCT 
        WHERE SERIAL_NUMBER IN ($serial_numbers_str_requests)
    ";
    $stmt_prod_requests = oci_parse($conn, $products_query_requests);
    oci_execute($stmt_prod_requests);

    $products_requests = [];
    $model_ids_requests = [];
    while ($row = oci_fetch_assoc($stmt_prod_requests)) {
        $products_requests[$row['SERIAL_NUMBER']] = $row['MODEL_ID'];
        $model_ids_requests[] = $row['MODEL_ID'];
    }
    oci_free_statement($stmt_prod_requests);
} else {
    $products_requests = [];
    $model_ids_requests = [];
}

// 관련된 MODEL 정보 가져오기 (요청용)
if (!empty($model_ids_requests)) {
    $model_ids_unique_requests = array_unique($model_ids_requests);
    $model_ids_str_requests = implode(',', array_map('intval', $model_ids_unique_requests));

    $models_query_requests = "
        SELECT MODEL_ID, MODEL_NAME 
        FROM MODEL 
        WHERE MODEL_ID IN ($model_ids_str_requests)
    ";
    $stmt_model_requests = oci_parse($conn, $models_query_requests);
    oci_execute($stmt_model_requests);

    $models_requests = [];
    while ($row = oci_fetch_assoc($stmt_model_requests)) {
        $models_requests[$row['MODEL_ID']] = $row['MODEL_NAME'];
    }
    oci_free_statement($stmt_model_requests);
} else {
    $models_requests = [];
}

// 관련된 VISIT 정보 가져오기 (요청용)
// 이미 VISIT_DATE를 ongoing_requests와 expired_requests 쿼리에서 가져왔으므로 별도 조회 불필요함
?>

<div class="container">
    <div style="display: flex;">


        <div class="left-section">
            <div class="form-group">
                <label class="input-label">이름</label>
                <input type="text" value="<?php echo htmlspecialchars($customer_name); ?>" class="input-field" readonly>
            </div>

            <div class="form-group">
                <label class="input-label">주 전화번호</label>
                <input type="text" value="<?php echo htmlspecialchars($main_phone_number); ?>" class="input-field" readonly>
            </div>

            <div class="form-group">
                <label class="input-label">보조 전화번호</label>
                <input type="text" value="<?php echo htmlspecialchars($sub_phone_number); ?>" class="input-field" readonly>
            </div>

            <div class="form-group">
                <label class="input-label">주소</label>
                <input type="text" value="<?php echo htmlspecialchars($postal_code); ?>" class="input-field" readonly>
                <input type="text" value="<?php echo htmlspecialchars($street_address); ?>" class="input-field" readonly>
                <input type="text" value="<?php echo htmlspecialchars($detail_address); ?>" class="input-field" readonly>
            </div>

            <a href="<?php echo TEAM_PATH; ?>/pages/customer/my_info/update_my_info.php" class="edit-button">회원정보 수정</a>
        </div>



        <div class="right-section">

            <div class="mb-6">
                <div class="section-title">나의 요청 목록</div>
                <div class="tabs" data-group="requests">
                    <button class="tab-button active" onclick="showContent('request-ongoing', 'requests')">진행 중인 요청</button>
                    <button class="tab-button" onclick="showContent('request-past', 'requests')">지난 요청</button>
                </div>
                <div id="request-ongoing" class="content-box" data-group="requests">
                    <?php if (empty($ongoing_requests)) : ?>
                        <p>진행 중인 요청이 없습니다.</p>
                    <?php else : ?>
                        <?php foreach ($ongoing_requests as $request) : ?>
                            <?php
                            $request_id = $request['REQUEST_ID'];
                            $subscription_id = $request['SUBSCRIPTION_ID'];
                            $serial_number = $subscription_info_requests[$subscription_id] ?? 'N/A';
                            $model_id = $products_requests[$serial_number] ?? 'N/A';
                            $model_name = $models_requests[$model_id] ?? 'N/A';
                            $request_type = $request['REQUEST_TYPE'];
                            $request_status = trim($request['REQUEST_STATUS']);
                            $prefer_date1 = '';
                            $prefer_date2 = '';
                            $visit_date = '';

                            // 선호일자 가져오기 (순서대로 할당)
                            $pref_query = "
                                SELECT PREFERENCE_ID, TO_CHAR(PREFER_DATE, 'YYYY-MM-DD HH24:MI:SS') AS PREFER_DATE
                                FROM REQUEST_PREFERENCE_DATE
                                WHERE REQUEST_ID = :request_id
                                ORDER BY PREFERENCE_ID ASC
                            ";
                            $stmt_pref = oci_parse($conn, $pref_query);
                            oci_bind_by_name($stmt_pref, ':request_id', $request_id);
                            oci_execute($stmt_pref);

                            $pref_dates = [];
                            while ($pref_row = oci_fetch_assoc($stmt_pref)) {
                                $pref_dates[] = $pref_row['PREFER_DATE'];
                            }
                            oci_free_statement($stmt_pref);

                            if (count($pref_dates) >= 1) {
                                $prefer_date1 = $pref_dates[0];
                            }
                            if (count($pref_dates) >= 2) {
                                $prefer_date2 = $pref_dates[1];
                            }

                            // VISIT_DATE 가져오기
                            if ($request_status == '방문예정' || $request_status == '방문완료') {
                                $visit_date_str = $request['VISIT_DATE'] ?? 'N/A';
                                if ($visit_date_str != 'N/A') {
                                    $visit_date_obj = DateTime::createFromFormat('Y-m-d H:i:s', $visit_date_str);
                                    if ($visit_date_obj) {
                                        $visit_date = $visit_date_obj->format('Y-m-d H:i:s');
                                    } else {
                                        $visit_date = 'N/A';
                                    }
                                } else {
                                    $visit_date = 'N/A';
                                }
                            }

                            // 요청 상태에 따른 버튼 표시 여부
                            $is_pending = ($request_status == '대기중');
                            ?>
                            <div class="product-card">

                                <div class="product-details">
                                    <p>
                                        구독번호: <span class="detail-value"><?= htmlspecialchars($subscription_id) ?></span>&emsp;
                                        모델 ID: <span class="detail-value"><?= htmlspecialchars($model_id) ?></span>
                                    </p>
                                    <p>
                                        요청 타입: <span class="detail-value"><?= htmlspecialchars($request_type) ?></span>&emsp;
                                        상태: <span class="detail-value"><?= htmlspecialchars($request_status) ?></span>
                                    </p>
                                    <p>
                                        요청 생성일: <span class="detail-value"><?= htmlspecialchars($request['DATE_CREATED']) ?></span>&emsp;
                                        <?php if (!empty($request['DATE_EDITED'])) : ?>
                                            요청 수정일: <span class="detail-value"><?= htmlspecialchars($request['DATE_EDITED']) ?></span>
                                        <?php endif; ?>
                                    </p>

                                    <?php if ($request_status == '대기중') : ?>
                                        <p>
                                            선호일자 1: <span class="detail-value"><?= htmlspecialchars($prefer_date1) ?></span>&emsp;
                                            선호일자 2: <span class="detail-value"><?= htmlspecialchars($prefer_date2) ?></span>
                                        </p>
                                    <?php elseif ($request_status == '방문예정') : ?>
                                        <p>
                                            방문 예정일: <span class="detail-value"><?= htmlspecialchars($visit_date) ?></span>
                                        </p>
                                    <?php elseif ($request_status == '방문완료') : ?>
                                        <p>
                                            방문 날짜: <span class="detail-value"><?= htmlspecialchars($visit_date) ?></span>
                                        </p>
                                    <?php endif; ?>
                                </div>



                                <?php if ($is_pending) : ?>
                                    <div class="product-actions">
                                        <button class="edit-button" onclick="openEditModal(<?= htmlspecialchars($request_id) ?>)">수정</button>
                                        <button class="cancel-button" onclick="cancelRequest(<?= htmlspecialchars($request_id) ?>, '<?= htmlspecialchars($request_type) ?>')">취소</button>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                <div id="request-past" class="content-box hidden" data-group="requests">
                    <?php if (empty($expired_requests)) : ?>
                        <p>지난 요청이 없습니다.</p>
                    <?php else : ?>
                        <?php foreach ($expired_requests as $request) : ?>
                            <?php
                            $request_id = $request['REQUEST_ID'];
                            $subscription_id = $request['SUBSCRIPTION_ID'];
                            $serial_number = $subscription_info_requests[$subscription_id] ?? 'N/A';
                            $model_id = $products_requests[$serial_number] ?? 'N/A';
                            $model_name = $models_requests[$model_id] ?? 'N/A';
                            $request_type = $request['REQUEST_TYPE'];
                            $request_status = trim($request['REQUEST_STATUS']);
                            $visit_date_str = $request['VISIT_DATE'] ?? 'N/A';
                            if ($visit_date_str != 'N/A') {
                                $visit_date_obj = DateTime::createFromFormat('Y-m-d H:i:s', $visit_date_str);
                                if ($visit_date_obj) {
                                    $visit_date = $visit_date_obj->format('Y-m-d H:i:s');
                                } else {
                                    $visit_date = 'N/A';
                                }
                            } else {
                                $visit_date = 'N/A';
                            }
                            ?>
                            <div class="product-card">

                                <div class="product-details">
                                    <p>
                                        구독번호: <span class="detail-value"><?= htmlspecialchars($subscription_id) ?></span>&emsp;
                                        모델 ID: <span class="detail-value"><?= htmlspecialchars($model_id) ?></span>
                                    </p>
                                    <p>
                                        요청 타입: <span class="detail-value"><?= htmlspecialchars($request_type) ?></span>&emsp;
                                        상태: <span class="detail-value"><?= htmlspecialchars($request_status) ?></span>
                                    </p>
                                    <p>
                                        요청 생성일: <span class="detail-value"><?= htmlspecialchars($request['DATE_CREATED']) ?></span>
                                        <?php if (!empty($request['DATE_EDITED'])) : ?>
                                            요청 수정일: <span class="detail-value"><?= htmlspecialchars($request['DATE_EDITED']) ?></span>
                                        <?php endif; ?>
                                    </p>

                                    <?php if ($request_status == '방문완료') : ?>
                                        <p>
                                            방문 날짜: <span class="detail-value"><?= htmlspecialchars($visit_date) ?></span>
                                        </p>
                                    <?php endif; ?>
                                </div>



                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>



            <div class="mb-6">
                <div class="section-title">나의 구독 목록</div>
                <div class="tabs" data-group="subscriptions">
                    <button class="tab-button active" onclick="showContent('subscription-current', 'subscriptions')">구독중</button>
                    <button class="tab-button" onclick="showContent('subscription-expired', 'subscriptions')">만료된 구독</button>
                </div>
                <div id="subscription-current" class="content-box" data-group="subscriptions">
                    <?php if (empty($current_subscriptions)) : ?>
                        <p>현재 구독 중인 제품이 없습니다.</p>
                    <?php else : ?>
                        <?php foreach ($current_subscriptions as $row) : ?>
                            <?php
                            $modelId = $row['MODEL_ID'];
                            $imagePath = TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($modelId) . ".jpg?" . time();
                            $beginDate = DateTime::createFromFormat('Y-m-d H:i:s', $row['BEGIN_DATE']);
                            $expiredDate = DateTime::createFromFormat('Y-m-d H:i:s', $row['EXPIRED_DATE']);
                            $currentDate = new DateTime();
                            $diff = $currentDate->diff($expiredDate);
                            $daysRemaining = $diff->days;

                            // 리뷰 존재 여부 확인
                            $hasReview = array_key_exists($modelId, $existing_reviews);
                            $buttonText = $hasReview ? '리뷰 수정' : '리뷰 작성';

                            // 진행 중인 수리 요청 여부
                            $hasOngoingRequest = $row['HAS_ONGOING_REQUEST'];
                            ?>
                            <div class="product-card">

                                <div class="product-details">
                                    <p class="text-lg font-medium">
                                        구독번호: <span class="detail-value"><?= htmlspecialchars($row['SUBSCRIPTION_ID']) ?></span>&emsp;
                                        모델 ID: <span class="detail-value"><?= htmlspecialchars($row['MODEL_ID']) ?></span>&emsp;
                                        모델명: <span class="detail-value"><?= htmlspecialchars($row['MODEL_NAME']) ?></span>
                                    </p>
                                    <p class="mt-2">시리얼 번호: <span class="detail-value"><?= htmlspecialchars($row['SERIAL_NUMBER']) ?></span></p>
                                    <p class="mt-2">
                                        구독기간: <span class="detail-value"><?= htmlspecialchars($row['BEGIN_DATE']) ?> ~ <?= htmlspecialchars($row['EXPIRED_DATE']) ?></span>
                                        <span style="color: green; font-weight: bold;">(<?= $daysRemaining ?>일 남음)</span>
                                    </p>
                                    <p class="mt-2">구독료</p>
                                    <ul>
                                        <li>연간: <span class="detail-value"><?= number_format($row['YEARLY_FEE']) ?>원</span></li>
                                        <li>월간: <span class="detail-value">약 <?= number_format($row['YEARLY_FEE'] / 12) ?>원</span></li>
                                    </ul>
                                </div>




                                <div class="product-actions">
                                    <?php if ($hasOngoingRequest) : ?>
                                        <!-- 진행 중인 수리 요청이 있는 경우 버튼 글자 -->
                                        <button class="repair-button disabled" disabled>진행 중인 수리 요청이 있습니다</button>
                                    <?php else : ?>

                                        <button class="repair-button"
                                            data-serial-number="<?= htmlspecialchars($row['SERIAL_NUMBER']) ?>"
                                            data-subscription-id="<?= htmlspecialchars($row['SUBSCRIPTION_ID']) ?>">
                                            수리 신청
                                        </button>
                                    <?php endif; ?>


                                    <button class="review-button" data-model-id="<?= htmlspecialchars($row['MODEL_ID']) ?>" data-has-review="<?= $hasReview ? '1' : '0' ?>">
                                        <?= $buttonText ?>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                <div id="subscription-expired" class="content-box hidden" data-group="subscriptions">
                    <?php if (empty($expired_subscriptions)) : ?>
                        <p>만료된 구독이 없습니다.</p>
                    <?php else : ?>
                        <?php foreach ($expired_subscriptions as $row) : ?>
                            <?php
                            $modelId = $row['MODEL_ID'];
                            $imagePath = TEAM_PATH . "/pages/customer/model/model_img/model" . htmlspecialchars($modelId) . ".jpg?" . time();

                            // 리뷰 존재 여부 확인
                            $hasReview = array_key_exists($modelId, $existing_reviews);
                            $buttonText = $hasReview ? '리뷰 수정' : '리뷰 작성';
                            ?>
                            <div class="product-card">

                                <div class="product-details">
                                    <p class="text-lg font-medium">
                                        구독번호: <span class="detail-value"><?= htmlspecialchars($row['SUBSCRIPTION_ID']) ?></span>&emsp;
                                        모델 ID: <span class="detail-value"><?= htmlspecialchars($row['MODEL_ID']) ?></span>&emsp;
                                        모델명: <span class="detail-value"><?= htmlspecialchars($row['MODEL_NAME']) ?></span>
                                    </p>
                                    <p class="mt-2">시리얼 번호: <span class="detail-value"><?= htmlspecialchars($row['SERIAL_NUMBER']) ?></span></p>
                                    <p class="mt-2">
                                        구독기간: <span class="detail-value"><?= htmlspecialchars($row['BEGIN_DATE']) ?> ~ <?= htmlspecialchars($row['EXPIRED_DATE']) ?></span>
                                        <span style="color: red; font-weight: bold;">(만료)</span>
                                    </p>
                                    <p class="mt-2">구독료</p>
                                    <ul>
                                        <li>연간: <span class="detail-value"><?= number_format($row['YEARLY_FEE']) ?>원</span></li>
                                        <li>월간: <span class="detail-value">약 <?= number_format($row['YEARLY_FEE'] / 12) ?>원</span></li>
                                    </ul>
                                </div>





                                <div class="product-actions">

                                    <button class="review-button" data-model-id="<?= htmlspecialchars($row['MODEL_ID']) ?>" data-has-review="<?= $hasReview ? '1' : '0' ?>">
                                        <?= $buttonText ?>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

        </div>

    </div>
</div>

<!-- 요청 수정 모달-->
<div id="edit-modal" class="modal-overlay">
    <div class="modal-container edit-modal">
        <h2 style="text-align: center;">요청 수정</h2>
        <div style="text-align: center;">
            <h4><span style="font-size: 0.9em; color: red;">(현재 시각 기준 24시간 이후 9:00 - 18:00 선택)</span></h4>
        </div>
        <form id="edit-form">
            <input type="hidden" name="request_id" id="edit-request-id" value="">
            <input type="hidden" name="preference_id_1" id="edit-preference-id-1" value="">
            <input type="hidden" name="preference_id_2" id="edit-preference-id-2" value="">

            <div class="form-group">
                <label for="prefer-date1"><span class="text-red-500">*</span> 선호일자 1</label>
                <input type="datetime-local" name="prefer_date1" id="edit-prefer-date1" required>
            </div>

            <div class="form-group">
                <label for="prefer-date2"><span class="text-red-500">*</span> 선호일자 2</label>
                <input type="datetime-local" name="prefer_date2" id="edit-prefer-date2" required>
            </div>

            <div class="button-group">
                <button type="submit" class="submit-btn">수정 완료</button>
                <button type="button" class="close-btn">취소</button>
            </div>
        </form>
    </div>
</div>




<!-- 리뷰 작성/수정 모달 -->
<div id="review-modal" class="modal-overlay">
    <div class="review-form-container">
        <h2 id="modal-title">리뷰 작성</h2>
        <form id="review-form">
            <div class="form-group">
                <label>
                    <span style="color: red;">*</span> 별점
                </label>
                <div class="star-container">
                    <input type="hidden" name="rating" id="rating-input" value="">

                    <?php for ($i = 1; $i <= 5; $i++) : ?>
                        <svg class="star" data-value="<?= $i ?>" viewBox="0 0 24 24">
                            <path
                                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.869 1.4-8.168L.132 9.21l8.2-1.192z" />
                        </svg>
                    <?php endfor; ?>
                </div>
            </div>
            <div class="form-group">
                <label>내용 (최대 1000자)</label>
                <textarea name="additional_comment" id="additional-comment" rows="5" maxlength="980"></textarea>
            </div>
            <div class="button-group">
                <button type="submit" class="submit-btn">등록</button>
                <button type="button" class="close-btn">닫기</button>
            </div>
            <input type="hidden" name="model_id" id="model-id-input" value="">
        </form>
    </div>
</div>

<!-- 수리 신청 모달 -->
<div id="repair-modal" class="modal-overlay">
    <div class="modal-container">
        <h1>수리 신청</h1>
        <div style="text-align: center;">
            <h4><span style="font-size: 0.9em; color: red;">(현재 시각 기준 24시간 이후 9:00 - 18:00 선택)</span></h4>
        </div>
        <form id="repair-form">
            <div class="mb-4">
                <label>
                    <span class="text-red-500">*</span> 선호 방문 일자 및 시간
                </label>
                <div class="space-y-2">
                    <div class="flex items-center">
                        <span>1</span>
                        <input type="datetime-local" name="preferred_datetime1" id="preferred-datetime1" class="flex-1" required>
                    </div>
                    <div class="flex items-center">
                        <span>2</span>
                        <input type="datetime-local" name="preferred_datetime2" id="preferred-datetime2" class="flex-1" required>
                    </div>
                </div>
            </div>
            <div class="mb-4">
                <label>
                    <span class="text-red-500">*</span> 증상 (최대 1000자)
                </label>
                <textarea name="symptom" rows="6" maxlength="1000" required></textarea>
            </div>
            <input type="hidden" name="subscription_id" id="repair-subscription-id" value="">
            <div class="flex space-x-2">
                <button type="submit" class="flex-1 submit-button">신청</button>
                <button type="button" class="flex-1 close-button">닫기</button>
            </div>
        </form>
    </div>
</div>


<script>
    function showContent(contentId, group) {
        const contentBoxes = document.querySelectorAll(`.content-box[data-group="${group}"]`);
        contentBoxes.forEach((box) => box.classList.add('hidden'));

        document.getElementById(contentId).classList.remove('hidden');

        const tabButtons = document.querySelectorAll(`.tabs[data-group="${group}"] .tab-button`);
        tabButtons.forEach((button) => button.classList.remove('active'));

        const activeButton = document.querySelector(`.tabs[data-group="${group}"] .tab-button[onclick="showContent('${contentId}', '${group}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // 24시간 이후 + 9시 ~ 18시 제한 설정
        const now = new Date();
        now.setHours(now.getHours() + 24); // 현재 시간 기준으로 24시간 이후

        const minDate = new Date(now.setHours(9, 0, 0, 0)); // 최소값: 오전 9시
        const maxDate = new Date(now.setHours(18, 0, 0, 0)); // 최대값: 오후 6시

        const datetime1 = document.getElementById("preferred-datetime1");
        const datetime2 = document.getElementById("preferred-datetime2");

        const setMinDateTime = (input) => {
            const isoMinDate = minDate.toISOString().slice(0, 16);
            input.min = isoMinDate;
        };

        setMinDateTime(datetime1);
        setMinDateTime(datetime2);

        const validateDateTime = (input) => {
            const value = input.value;
            if (!value) {
                input.setCustomValidity("필수 항목입니다.");
                input.classList.add("border-red-500");
            } else {
                const selectedDate = new Date(value);
                const minDate = new Date(input.min);

                // 최소 날짜와 시간 조건
                if (selectedDate < minDate) {
                    input.setCustomValidity("방문 날짜는 현재 시간으로부터 최소 24시간 이후여야 합니다.");
                    input.classList.add("border-red-500");
                }
                // 9시 ~ 18시 조건
                else if (selectedDate.getHours() < 9 || selectedDate.getHours() >= 18) {
                    input.setCustomValidity("방문 시간은 오전 9시부터 오후 6시 사이여야 합니다.");
                    input.classList.add("border-red-500");
                } else {
                    input.setCustomValidity("");
                    input.classList.remove("border-red-500");
                }
            }
            input.reportValidity();
        };

        datetime1.addEventListener("input", () => validateDateTime(datetime1));
        datetime2.addEventListener("input", () => validateDateTime(datetime2));

        // 모달 열기 (리뷰 모달)
        document.querySelectorAll('.review-button').forEach(function(button) {
            button.addEventListener('click', function() {
                const modelId = button.getAttribute('data-model-id');
                const hasReview = button.getAttribute('data-has-review') === '1';
                document.getElementById('model-id-input').value = modelId;
                document.getElementById('review-modal').classList.add('show');

                // 모달 제목 변경
                const modalTitle = document.getElementById('modal-title');
                modalTitle.textContent = hasReview ? '리뷰 수정' : '리뷰 작성';

                // 기존 리뷰가 있다면 값 채우기
                if (hasReview) {
                    fetch(`get_review.php?model_id=${modelId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // 별점 설정
                                const rating = parseInt(data.rating);
                                const ratingInput = document.getElementById('rating-input');
                                ratingInput.value = rating;

                                const stars = document.querySelectorAll('.star');
                                stars.forEach((s, index) => {
                                    s.classList.toggle('selected', index < rating);
                                });

                                // 추가 코멘트 설정
                                const additionalComment = document.getElementById('additional-comment');
                                additionalComment.value = data.additional_comment;
                            } else {
                                alert('리뷰 정보를 불러오는 데 실패했습니다: ' + data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('리뷰 정보를 불러오는 중 오류가 발생했습니다.');
                        });
                } else {
                    // 기존 값 초기화
                    document.getElementById('rating-input').value = '';
                    document.getElementById('additional-comment').value = '';
                    document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
                }
            });
        });

        // 모달 닫기 (리뷰, 수정, 수리 신청 모달)
        document.querySelectorAll('.close-btn').forEach(function(button) {
            button.addEventListener('click', function() {
                document.getElementById('review-modal').classList.remove('show');
                document.getElementById('edit-modal').classList.remove('show');
                document.getElementById('repair-modal').classList.remove('show');
            });
        });

        // 별점 선택 기능
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.getElementById('rating-input');

        stars.forEach((star) => {
            star.addEventListener('click', () => {
                const ratingValue = star.getAttribute('data-value');
                ratingInput.value = ratingValue;

                stars.forEach((s) => {
                    s.classList.remove('selected');
                });

                for (let i = 0; i < ratingValue; i++) {
                    stars[i].classList.add('selected');
                }
            });
        });

        // 리뷰 폼 제출 처리
        const reviewForm = document.getElementById('review-form');
        reviewForm.addEventListener('submit', function(event) {
            event.preventDefault(); // 기본 폼 제출 동작 방지

            // 별점 유효성 검사
            if (!ratingInput.value) {
                alert('별점을 선택해주세요.');
                return;
            }

            // 서버로 폼 데이터 전송
            const formData = new FormData(reviewForm);

            fetch('submit_review.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.text())
                .then(result => {
                    if (result.trim() === 'success') {
                        alert('리뷰가 등록되었습니다.');
                        // 폼 초기화 및 모달 닫기
                        reviewForm.reset();
                        ratingInput.value = '';
                        stars.forEach((s) => s.classList.remove('selected'));
                        document.getElementById('review-modal').classList.remove('show');
                        // 페이지 새로고침하여 버튼 텍스트 업데이트
                        location.reload();
                    } else {
                        alert(result); // 서버로부터 받은 에러 메시지 표시
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('리뷰 등록 중 오류가 발생했습니다.');
                });
        });

        // 수리 신청 버튼 클릭 시 모달 열기 또는 알림 표시
        document.querySelectorAll('.repair-button').forEach(function(button) {
            button.addEventListener('click', function() {
                // 버튼이 비활성화된 경우 (진행 중인 수리 요청이 있는 경우)
                if (button.classList.contains('disabled')) {
                    alert('현재 진행 중인 수리 요청이 있습니다.');
                    return;
                }

                const subscriptionId = button.getAttribute('data-subscription-id');
                document.getElementById('repair-subscription-id').value = subscriptionId;
                document.getElementById('repair-modal').classList.add('show');
            });
        });

        // 수리 신청 모달 닫기
        document.querySelectorAll('#repair-modal .close-button').forEach(function(button) {
            button.addEventListener('click', function() {
                document.getElementById('repair-modal').classList.remove('show');
            });
        });

        // 수리 신청 폼 제출 처리
        document.getElementById('repair-form').addEventListener('submit', function(event) {
            event.preventDefault();

            // 폼 데이터 가져오기
            const formData = new FormData(this);

            // 입력 검증
            const preferredDatetime1 = formData.get('preferred_datetime1');
            const preferredDatetime2 = formData.get('preferred_datetime2');
            const symptom = formData.get('symptom');

            if (!preferredDatetime1 || !preferredDatetime2 || !symptom) {
                alert('모든 필수 항목을 입력해주세요.');
                return;
            }

            // 현재 시간 기준 24시간 이후인지 확인
            const now = new Date();
            const koreaTimeOffset = 9 * 60; // UTC+9 시간차를 분 단위로 계산
            const nowKorea = new Date(now.getTime() + (now.getTimezoneOffset() + koreaTimeOffset) * 60000);

            const datetime1 = new Date(preferredDatetime1);
            const datetime2 = new Date(preferredDatetime2);

            const diff1 = datetime1 - nowKorea;
            const diff2 = datetime2 - nowKorea;

            if (diff1 < 24 * 60 * 60 * 1000 || diff2 < 24 * 60 * 60 * 1000) {
                alert('선호 방문 일자 및 시간은 현재로부터 24시간 이후여야 합니다.');
                return;
            }

            // 서버로 전송 (AJAX)
            fetch('submit_repair_request.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.text())
                .then(result => {
                    if (result.trim() === 'success') {
                        alert('수리 신청이 완료되었습니다.');
                        // 폼 초기화 및 모달 닫기
                        this.reset();
                        document.getElementById('repair-modal').classList.remove('show');
                        // 페이지 새로고침하여 버튼 상태 업데이트
                        location.reload();
                    } else {
                        alert(result); // 서버로부터 받은 에러 메시지 표시
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('수리 신청 중 오류가 발생했습니다.');
                });
        });

        // 요청 수정 모달 열기 함수
        window.openEditModal = function(requestId) {
            // 현재 요청의 상세 정보 가져오기 via AJAX
            fetch(`get_request_details.php?request_id=${requestId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const request = data.request;
                        if (request.REQUEST_STATUS === '방문예정') {
                            alert('방문예정 상태인 경우 수정이 불가능합니다.');
                            return;
                        }
                        const preferences = data.preferences;
                        if (preferences.length < 2) {
                            alert('선호일자 정보가 충분하지 않습니다.');
                            return;
                        }
                        // 선호일자 1 설정
                        document.getElementById('edit-request-id').value = request.REQUEST_ID;
                        document.getElementById('edit-preference-id-1').value = preferences[0].preference_id;
                        document.getElementById('edit-prefer-date1').value = preferences[0].prefer_date.replace(' ', 'T').substring(0, 16);

                        // 선호일자 2 설정
                        document.getElementById('edit-preference-id-2').value = preferences[1].preference_id;
                        document.getElementById('edit-prefer-date2').value = preferences[1].prefer_date.replace(' ', 'T').substring(0, 16);

                        document.getElementById('edit-modal').classList.add('show');
                    } else {
                        alert('요청 정보를 불러오는 데 실패했습니다: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('요청 정보를 불러오는 중 오류가 발생했습니다.');
                });
        }

        // 수정 모달 닫기
        document.querySelectorAll('#edit-modal .close-btn').forEach(function(button) {
            button.addEventListener('click', function() {
                document.getElementById('edit-modal').classList.remove('show');
            });
        });

        // 수정 폼 제출 처리
        document.getElementById('edit-form').addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(this);

            // 선호일자 유효성 검사 (24시간 이후)
            const preferDate1 = new Date(formData.get('prefer_date1'));
            const preferDate2 = new Date(formData.get('prefer_date2'));
            const now = new Date();
            const koreaOffset = 9 * 60; // UTC+9
            const nowKorea = new Date(now.getTime() + (now.getTimezoneOffset() + koreaOffset) * 60000);

            if (preferDate1 - nowKorea < 24 * 60 * 60 * 1000 || preferDate2 - nowKorea < 24 * 60 * 60 * 1000) {
                alert('선호일자는 현재 시간으로부터 24시간 이후여야 합니다.');
                return;
            }

            // 선호일자와 preference_id를 배열로 구성
            const preferences = [{
                    preference_id: formData.get('preference_id_1'),
                    prefer_date: formData.get('prefer_date1'),
                },
                {
                    preference_id: formData.get('preference_id_2'),
                    prefer_date: formData.get('prefer_date2'),
                },
            ];

            // 서버로 전송 (JSON 형식)
            fetch('update_request_preferences.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        request_id: formData.get('request_id'),
                        preferences: preferences,
                    }),
                })
                .then(response => response.text())
                .then(text => {
                    console.log('Update Response text:', text); // 응답 텍스트 출력
                    try {
                        const data = JSON.parse(text);
                        if (data.success) {
                            alert(data.message);
                            document.getElementById('edit-modal').classList.remove('show');
                            location.reload();
                        } else {
                            alert(data.message + (data.error ? '\n오류: ' + data.error : ''));
                        }
                    } catch (e) {
                        console.error('Invalid JSON response:', text);
                        alert('요청 처리 중 예상치 못한 오류가 발생했습니다.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('요청 수정 중 오류가 발생했습니다.');
                });
        });

        window.cancelRequest = function(requestId, requestType) {
            if (!confirm('정말 요청을 취소하시겠습니까?')) {
                return;
            }

            fetch('cancel_request.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        request_id: requestId,
                        request_type: requestType,
                    }),
                })
                .then(response => response.text())
                .then(text => {
                    console.log('Cancel Response text:', text); // 응답 텍스트 출력
                    try {
                        const data = JSON.parse(text);
                        if (data.success) {
                            alert(data.message);
                            location.reload();
                        } else {
                            alert(data.message + (data.error ? '\n오류: ' + data.error : ''));
                        }
                    } catch (e) {
                        console.error('Invalid JSON response:', text);
                        alert('요청 처리 중 예상치 못한 오류가 발생했습니다.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('요청 처리 중 오류가 발생했습니다.');
                });
        };
    });
</script>



<?php
oci_close($conn);
include BASE_PATH . '/includes/footer.php';
?>