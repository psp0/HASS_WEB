<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkbox Form</title>
</head>

<body>
    <form method="GET" action="">
        <input type="checkbox" name="subject[]" id="subject8" value="6701">
        <label for="subject8">국어</label>
        <input type="checkbox" name="subject[]" id="subject17" value="6702">
        <label for="subject17">영어</label>
        <input type="checkbox" name="subject[]" id="subject24" value="6703">
        <label for="subject24">수학</label>
        <input type="checkbox" name="subject[]" id="subject30" value="6704">
        <label for="subject30">사회</label>
        <br>
        <button type="submit">Submit</button>
    </form>

    <div class="container">
        <?php 
        if (isset($_GET['subject'])) {
            $data = $_GET['subject'];
            
            // Print original data array
            echo "<p>Selected Subjects (Original):</p>";
            echo "<pre>";
            print_r($data);
            echo "</pre>";

            // Process the data using setCheckBox function
            $processedData = setCheckBox($data);

            // Print processed data
            echo "<p>Processed Subjects (Comma-separated):</p>";
            echo "<pre>$processedData</pre>";
        }

        function setCheckBox($array) {
            $tmp = "";
            foreach ($array as $index => $row) {
                if (!is_numeric($row)) {
                    $row = "'" . $row . "'";
                }

                if ($index === array_key_first($array)) {
                    $tmp = $row;
                } else {
                    $tmp .= ',' . $row;
                }
            }
            return $tmp;
        }
        ?>
    </div>
</body>

</html>
