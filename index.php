<?php
require 'config.php';
include BASE_PATH . '/includes/customer_header.php';
?>
<style>
.background-container {
    position: relative;
    background-image: url('./img/background.jpg');
    background-size: cover;
    background-position: center;
    height: 85vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.background-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1;
}

.container-title {
    position: relative;
    z-index: 2;
    color: white;
    text-align: center;
    padding: 20px;
    opacity: 0;
    animation: fadeIn 2s ease-in forwards;
}

.container-title div {
    font-size: x-large;
    font-weight: bold;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>
<div class="background-container">
    <div class="container-title">
        <div>가전제품 구독서비스</div>
        <div>HASS에 오신 것을</div>
        <div>환영합니다!</div>
    </div>
</div>

<?php
include BASE_PATH . '/includes/footer.php';
?>