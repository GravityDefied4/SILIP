<?php
    header("Content-Type: application/json");
    require '../../vendor/autoload.php';

    use Rootscratch\PSGC\PSGC;

    $psgcApi = new PSGC();

    $type = $_GET['type'] ?? null;

    try {
        switch ($type) {

            // GET ALL REGIONS
            case 'regions':
                $regions = $psgcApi->Regions();

                echo json_encode($regions, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

                break;

            // GET PROVINCES BY REGION
            case 'provinces':
                $provinces = $psgcApi->Provinces();

                echo json_encode($provinces, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

                break;

            // INVALID TYPE
            default:
                echo json_encode([
                    "error" => "Invalid type parameter"
                ]);
        }

    } catch (Exception $e) {
        echo json_encode([
            "error" => $e->getMessage()
        ]);
    }
?>