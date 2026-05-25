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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project SILIP — Dashboard</title>
    <link rel="stylesheet" href="main.css">
</head>
<body>

    <!-- Header -->
    <header class="header">
        <a href="/SILIP/public" class="header-title">Project SILIP</a>
        <a href="/SILIP/public/auth/logout"><button class="gradient-btn">Logout</button></a>
    </header>

    <!-- Main Content -->
    <div class="container">
        <h1>Flood Control Projects</h1>

        <!-- Filters -->
        <div class="dropdown-container">
            <label for="region">
                Region
                <select id="region">
                    <option value="">Select Region</option>
                </select>
            </label>

            <label for="province">
                <span id="provinceLabel">Province</span>
                <select id="province" disabled>
                    <option value="">All Provinces</option>
                </select>
            </label>

            <label for="municipalitySearch">
                <span id="municipalityLabel">Search Municipality</span>
                <input
                    type="text"
                    id="municipalitySearch"
                    placeholder="e.g. Dagupan"
                    disabled
                />
            </label>
        </div>

        <!-- Results Table -->
        <div id="resultsTable">
            <div class="empty-state">
                <p>Select a region to view flood control projects.</p>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>