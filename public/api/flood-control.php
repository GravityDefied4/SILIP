<?php
    require 'psgc.php';
    header("Content-Type: application/json");

    $url = "https://raw.githubusercontent.com/bettergovph/bettergov/refs/heads/main/src/data/flood_control/flood_control.json";
    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);

    if ($response === false) {
        echo json_encode([
            "error" => "Source link not responding: " . curl_error($ch)
        ]);
        curl_close($ch);
        exit;
    }

    $httpCode=curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode != 200) {
        echo json_encode([
            "error" => "Source link returned status code: " . $httpCode
        ]);
        exit;
    }

    $data = json_decode($response, true);
    $project = $data["features"];
    $psgcRegion = $_GET['region'] ?? null;

    foreach ($project as $proj) {
        if (isset($proj["attributes"]["Region"]) && strtolower($proj["attributes"]["Region"]) === strtolower($psgcRegion)) {
            echo json_encode($proj, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        }
    }
?>