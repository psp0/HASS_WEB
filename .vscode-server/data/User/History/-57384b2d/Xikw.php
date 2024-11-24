<?php
require '../../config.php';
include BASE_PATH . '/includes/worker_header.php';
?>
<script src="https://cdn.tailwindcss.com"></script>
<style>
    body {
        font-family: 'Noto Sans KR', sans-serif;
    }

    .product-info {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .product-details {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .product-image {
        width: 120px;
        height: 120px;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        top: 10px;
        left: 10px;
    }

    .section-title {
        color: #1D4ED8;
        font-weight: bold;
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
    }

    .no-product-message {
        font-size: 1.5rem;
        font-weight: bold;
        color: red;
        text-align: center;
        margin-top: 20px;
    }
</style>