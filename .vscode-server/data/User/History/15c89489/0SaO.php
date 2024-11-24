<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <input type="checkbox" name="subject[]" id="subject8" value="6701">
    <label for="subject8">국어</label>
    <input type="checkbox" name="subject[]" id="subject17" value="6702">
    <label for="subject17">영어</label>
    <input type="checkbox" name="subject[]" id="subject24" value="6703">
    <label for="subject24">수학</label>
    <input type="checkbox" name="subject[]" id="subject30" value="6704">
    <label for="subject30">사회 </label>


    <div class="container">
        <?php 
         $data = $this->input->get(NULL, TRUE);
         print_r($data['subject']);
         $data['subject'] = setCheckBox($data['subject']);
         print_r($data['subject']);
        ?>
       
    </div>
    <script>
        function setCheckBox(array $array) {
            $tmp = "";
            foreach($array as $index => $row){
                if (is_numeric($row) === false)
                    $row = "'".$row. "'";

                if ($index === array_key_first($array))
                    $tmp = $row;
                else
                    $tmp.= ','.$row;
            }
            return $tmp;
    </script>
</body>

</html>
