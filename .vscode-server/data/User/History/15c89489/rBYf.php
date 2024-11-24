<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkbox Form</title>
</head>

<body>
    <!-- 체크박스 폼 생성 -->
    <form method="GET" action="">
        <!-- 개별 체크박스: 각 체크박스는 `subject[]` 배열 이름을 가짐 -->
        <input type="checkbox" name="subject[]" id="subject8" value="6701">
        <label for="subject8">국어</label>
        <input type="checkbox" name="subject[]" id="subject17" value="6702">
        <label for="subject17">영어</label>
        <input type="checkbox" name="subject[]" id="subject24" value="6703">
        <label for="subject24">수학</label>
        <input type="checkbox" name="subject[]" id="subject30" value="6704">
        <label for="subject30">사회</label>
        <br>
        <!-- 폼 제출 버튼 -->
        <button type="submit">Submit</button>
    </form>

    <div class="container">
        <?php 
        // 체크박스에서 선택된 데이터가 있는지 확인
        if (isset($_GET['subject'])) {
            $data = $_GET['subject']; // 선택된 체크박스 값을 배열로 가져
            // 원본 데이터 배열 출력
            echo "<p>Selected Subjects (Original):</p>";
            echo "<pre>";
            print_r($data); // 선택된 값 출력 (디버그용)
            echo "</pre>";

            // 선택된 데이터를 콤마로 구분된 문자열로 변환
            $processedData = setCheckBox($data);

            // 처리된 데이터를 출력
            echo "<p>Processed Subjects (Comma-separated):</p>";
            echo "<pre>$processedData</pre>";
        }

        // 배열을 콤마로 구분된 문자열로 변환하는 함수 정의
        function setCheckBox($array) {
            $tmp = ""; // 결과를 저장할 빈 문자열 초기화
            foreach ($array as $index => $row) {
                // 숫자가 아닌 경우, 작은따옴표로 감싸기
                if (!is_numeric($row)) {
                    $row = "'" . $row . "'";
                }

                // 배열의 첫 번째 항목일 경우 처리
                if ($index === array_key_first($array)) {
                    $tmp = $row;
                } else {
                    // 첫 번째 항목이 아닐 경우, 콤마로 구분하여 추가
                    $tmp .= ',' . $row;
                }
            }
            return $tmp; // 최종 콤마로 구분된 문자열 반환
        }
        ?>
    </div>
</body>

</html>
