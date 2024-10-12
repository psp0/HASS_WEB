<?php
require '../config.php';
include BASE_PATH . '/includes/header.php';
?>
<div class="container">
    <div class="row">
        <div class="">
            <div class=" panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">로그인</h3>
                </div>
                <div class="panel-body">
                    <form role="form" action="login_process.php" method="post">
                        <fieldset>
                            <div class="form-group">
                                <input class="form-control" placeholder="아이디" name="id" type="text" autofocus>
                            </div>
                            <div class="form-group">
                                <input class="form-control" placeholder="비밀번호" name="password" type="password" value="">
                            </div>
                            <button type="submit" >로그인</button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>


<?php
    include BASE_PATH . '/includes/footer.php';
?>