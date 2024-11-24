<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Comparison</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <?php
        $config = require '../../../config.php';
        $dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$config['host']})(PORT={$config['port']}))(CONNECT_DATA=(SID={$config['sid']})))";
        $conn = oci_connect($config['username'], $config['password'], $dsn, 'UTF8');

        if (!$conn) {
            $e = oci_error();
            echo "<p class='text-red-500'>연결 실패: " . htmlspecialchars($e['message']) . "</p>";
            exit;
        }

        $query = "SELECT mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                     mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE, 
                     NVL(AVG(mr.RATING), 0) AS AVG_RATING, COUNT(mr.RATING) AS RATING_COUNT
              FROM MODEL_AIRCLEANER_SPEC mas
              JOIN MODEL m ON mas.MODEL_ID = m.MODEL_ID
              LEFT JOIN MODEL_RATING mr ON mas.MODEL_ID = mr.SUBSCRIPTION_ID
              GROUP BY mas.MODEL_ID, m.MODEL_NAME, m.RELEASE_YEAR, mas.FILTER_TYPE, mas.PM_SENSOR, mas.FILTER_GRADE, 
                       mas.COVERAGE_AREA, m.COLOR, m.ENERGY_RATING, m.YEARLY_FEE
              ORDER BY mas.MODEL_ID ASC";

        $stmt = oci_parse($conn, $query);
        oci_execute($stmt);

        while ($row = oci_fetch_array($stmt, OCI_ASSOC + OCI_RETURN_NULLS)) {
            $avgRating = round($row['AVG_RATING'], 1);
            $monthlyFee = round($row['YEARLY_FEE'] / 12, 1);

            echo "<div class='bg-white p-4 rounded-lg shadow-md'>";
            echo "<div class='flex justify-between items-center mb-2'>";
            echo "<h2 class='text-lg font-bold'>" . htmlspecialchars($row['MODEL_NAME']) . " <span class='text-blue-600'>AirCleaner</span></h2>";
            echo "<span class='text-sm text-gray-500'>" . htmlspecialchars($row['RELEASE_YEAR']) . "년 출시</span>";
            echo "</div>";

            echo "<div class='flex items-center mb-4'>";
            echo "<span class='text-sm text-gray-500'>MODEL_ID: " . htmlspecialchars($row['MODEL_ID']) . "</span>";
            echo "<div class='flex items-center ml-4'>";
            echo "<svg class='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>";
            echo "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.455a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.37-2.455a1 1 0 00-1.175 0l-3.37 2.455c-.784.57-1.838-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.98 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z'></path>";
            echo "</svg>";
            echo "<span class='ml-1 text-sm text-gray-500'>" . htmlspecialchars($row['RATING_COUNT']) . "</span>";
            echo "<button class='ml-2 text-sm text-green-600 border border-green-600 rounded px-2 py-1'>리뷰 보기</button>";
            echo "</div>";
            echo "</div>";

            echo "<img src='https://via.placeholder.com/150' alt='Product Image' class='w-full h-40 object-cover mb-4'>";
            echo "<ul class='text-sm text-gray-700 mb-4'>";
            echo "<li>필터 종류: " . htmlspecialchars($row['FILTER_TYPE']) . " · PM센서: " . htmlspecialchars($row['PM_SENSOR']) . "</li>";
            echo "<li>필터 등급: " . htmlspecialchars($row['FILTER_GRADE']) . " · 공기청정 면적: " . htmlspecialchars($row['COVERAGE_AREA']) . "m²</li>";
            echo "<li>에너지 등급: " . htmlspecialchars($row['ENERGY_RATING']) . " · 색상: " . htmlspecialchars($row['COLOR']) . "</li>";
            echo "</ul>";

            echo "<div class='text-lg font-bold mb-2'>연 " . number_format($row['YEARLY_FEE']) . " 원</div>";
            echo "<div class='text-sm text-gray-500 mb-4'>월 약 " . number_format($monthlyFee) . "원</div>";
            echo "<button class='w-full bg-green-600 text-white py-2 rounded'>구독 신청</button>";
            echo "</div>";
        }

        oci_free_statement($stmt);
        oci_close($conn);
        ?>
    </div>
</body>
</html>
