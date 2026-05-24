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

    <script>
        const regionSelect = document.getElementById('region');
        const provinceSelect = document.getElementById('province');
        const resultsTable = document.getElementById('resultsTable');

        let allRegions = [];
        let allProvinces = [];

        // Fetches all initial PSGC data to enable client-side filtering
        console.log("Fetching initial data...");
        Promise.all([
            fetch('../src/psgc.php?type=regions').then(async res => {
                if (!res.ok) {
                    const err = await res.text();
                    throw new Error('Failed to fetch regions: ' + err);
                }
                return res.json();
            }),
            fetch('../src/psgc.php?type=provinces').then(async res => {
                if (!res.ok) {
                    const err = await res.text();
                    throw new Error('Failed to fetch provinces: ' + err);
                }
                return res.json();
            })
        ]).then(([regions, provinces]) => {
            console.log("Data loaded successfully.");
            allRegions = regions;
            allProvinces = provinces;

            // Populates region dropdown
            regions.forEach(reg => {
                regionSelect.innerHTML += `<option value="${reg.psgc_id}">${reg.name}</option>`;
            });
            console.log("Region dropdown populated.");
        }).catch(err => {
            console.error("Error loading initial data:", err);
            resultsTable.innerHTML = `<p style="color: red;">Error loading initial data: ${err.message}. Check browser console for details.</p>`;
        });

        // Renders project data into Results Table
        function renderTable(data) {
            if (data.length > 0) {
                let html = '<table><thead><tr>';
                Object.keys(data[0]).forEach(key => html += `<th>${key}</th>`);
                html += '</tr></thead><tbody>';
                data.forEach(row => {
                    html += '<tr>';
                    Object.values(row).forEach(val => html += `<td>${val}</td>`);
                    html += '</tr>';
                });
                html += '</tbody></table>';
                resultsTable.innerHTML = html;
            } else {
                resultsTable.innerHTML = '<p>No results available, please select a value on the next dropdown if applicable.</p>';
            }
        }

        // Fetches filtered projects from backend
        function fetchAndDisplay(field, value) {
            fetch(`../src/flood-control.php?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`)
                .then(res => res.json())
                .then(data => renderTable(data))
                .catch(err => {
                    console.error("Error fetching projects:", err);
                    resultsTable.innerHTML = '<p>Error fetching projects.</p>';
                });
        }

        // Populates provinces dropdown based on region selection
        regionSelect.addEventListener('change', () => {
            provinceSelect.innerHTML = '<option value="">Select Province</option>';
            provinceSelect.disabled = true;
            resultsTable.innerHTML = '';

            if (regionSelect.value) {
                const prefix = regionSelect.value.substring(0, 2);
                allProvinces.filter(prov => {return prov.psgc_id.substring(0, 2) === prefix;})
                    .forEach(prov => {
                        provinceSelect.innerHTML += `<option value="${prov.psgc_id}">${prov.name}</option>`;
                    });
                provinceSelect.disabled = false;
                
                // Shows projects for selected Region
                fetchAndDisplay('Region', regionSelect.options[regionSelect.selectedIndex].text);
            }
        });

        provinceSelect.addEventListener('change', () => {
            resultsTable.innerHTML = '';

            if (provinceSelect.value) {
                // Shows projects for selected Province
                fetchAndDisplay('Province', provinceSelect.options[provinceSelect.selectedIndex].text);
            }
        });
    </script>
</body>
</html>