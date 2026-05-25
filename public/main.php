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
        <h1 href="" class="logo">Project<img src="images/logo1.png" alt="" class="header-logo"></h1>
        <a href="/SILIP/public/auth/logout"><button class="gradient-btn">Logout</button></a>
    </header>

    <!-- Main Content -->
    <div class="container">
        <h1 class="container-title" style="text-align:center; font-family: 'Poppins', sans-serif; font-size: 5rem; margin-bottom: 2rem; color: var(--text-color); font-weight: 600; margin-top: 50px;">Flood Control Projects</h1>

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
        <div class="results-wrapper">
            <div id="loadingOverlay" class="loading-overlay hidden">
                <div class="loader"></div>
                <span style="font-size: 1.5rem;">Fetching Data…</span>
            </div>
            <div id="resultsTable">
                <div class="empty-state">
                    <p></p>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>