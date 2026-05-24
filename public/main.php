<?php
    // ── Auth routing ──────────────────────────────────────
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri = rtrim($uri, '/');

    if ($uri === '/SILIP/public/auth/login')    { require __DIR__ . '/auth/login.php';    exit; }
    if ($uri === '/SILIP/public/auth/callback') { require __DIR__ . '/auth/callback.php'; exit; }
    if ($uri === '/SILIP/public/auth/logout')   { require __DIR__ . '/auth/logout.php';   exit; }
    // ── End auth routing ──────────────────────────────────
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Project SILIP</title>
    <style>
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .dropdown-container { margin-bottom: 20px; }
    </style>
</head>
<body>
    <!-- Dropdown for selecting locations -->
    <div class="dropdown-container">
        <label>Region:</label>
        <select id="region">
            <option value="">Select Region</option>
        </select>

        <label>Province:</label>
        <select id="province" disabled>
            <option value="">Select Province</option>
        </select>
    </div>

    <!-- Project Results Table -->
    <div id="resultsTable"></div>
</body>
<script src="script.js"></script>
</html>