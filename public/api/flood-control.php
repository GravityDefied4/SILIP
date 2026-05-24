<?php
    require_once '../../src/Services/FloodControlService.php';
    header("Content-Type: application/json");

    $field = $_GET['field'] ?? 'Region';
    $value = $_GET['value'] ?? $_GET['location'] ?? '';

    if (!$value) {
        echo json_encode([
            "error" => "Value is required"
        ]);
        exit;
    }

    $service = new FloodControlService();
    $results = $service->getProjectsByField($field, $value);

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>