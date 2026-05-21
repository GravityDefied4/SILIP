<?php
    header("Content-Type: application/json");
    require '../vendor/autoload.php';

    use Rootscratch\PSGC\PSGC;

    $psgcApi = new PSGC();

    $regions = $psgcApi->Regions();
    $provinces = $psgcApi->Provinces();
    $municities = $psgcApi->MunicipalAndCities();
    $municipalities = $psgcApi->Municipal();
    $cities = $psgcApi->City();
    // $psgcRegion = "Region I";
    $psgcRegion = $_GET['region'] ?? null;
    // echo json_encode($provinces, JSON_PRETTY_PRINT);
?>