const regionSelect = document.getElementById('region');
const provinceSelect = document.getElementById('province');
const municipalityLabel = document.getElementById('municipalityLabel');
const municipalitySearch = document.getElementById('municipalitySearch');
const resultsTable = document.getElementById('resultsTable');
let allRegions = [];
let allProvinces = [];
let currentData = []; // holds the last fetched dataset for client-side filtering

// NCR PSGC prefix — NCR has no provinces, only cities/municipalities
const NCR_PREFIX = '13';

// Header display mapping for user-friendly column names
const headerMapping = {
    'region': 'Region',
    'province': 'Province',
    'municipality': 'Municipality',
    'startDate': 'Start Date',
    'CompletionDateActual': 'End Date',
    'contractor': 'Contractor',
    'ProjectComponentDescription': 'Project Description',
    'ContractCost': 'Budget',
};

// Helper to convert key to display name
function getDisplayName(key) {
    return headerMapping[key] || key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Fetches all initial PSGC data to enable client-side filtering
Promise.all([
    fetch('api/psgc.php?type=regions').then(async res => {
        if (!res.ok) {
            const err = await res.text();
            throw new Error('Failed to fetch regions: ' + err);
        }
        return res.json();
    }),
    fetch('api/psgc.php?type=provinces').then(async res => {
        if (!res.ok) {
            const err = await res.text();
            throw new Error('Failed to fetch provinces: ' + err);
        }
        return res.json();
    })
]).then(([regions, provinces]) => {
    allRegions = regions;
    allProvinces = provinces;

    // Populates region dropdown
    regions.forEach(reg => {
        regionSelect.innerHTML += `<option value="${reg.psgc_id}">${reg.name}</option>`;
    });
}).catch(err => {
    resultsTable.innerHTML = `<p style="color: red;">Error loading initial data: ${err.message}. Check browser console for details.</p>`;
});

// Renders project data into Results Table
function renderTable(data) {
    if (data.length > 0) {
        const keys = Object.keys(data[0]);
        const visibleKeys = keys.filter(k => !['latitude', 'longitude', 'legislativedistrict'].includes(k.toLowerCase()));
        const isNCR = data.length > 0 && data[0]['Region'] === 'National Capital Region';

        let html = '<table><thead><tr>';
        visibleKeys.forEach(key => {
            let label = getDisplayName(key);
            if (isNCR && key === 'Province') label = 'City';
            if (isNCR && key === 'Municipality') label = 'District';
            html += `<th>${label}</th>`;
        });
        html += '<th>Map</th>';
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';

            // Render only visible columns
            visibleKeys.forEach(key => {
                const colClass = `col-${key.toLowerCase()}`;
                let cellValue = row[key];
                if (key === 'ContractCost') cellValue = '₱' + Number(cellValue).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                if (key === 'StartDate' && cellValue) {
                    const [m, d, y] = cellValue.split('/');
                    cellValue = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
                }
                if (key === 'Municipality' && row['Region'] === 'National Capital Region') {
                    const ld = row['LegislativeDistrict'] || '';
                    cellValue = ld.replace(/^[^(]+\(([^)]+)\).*$/, '$1').trim();
                }
                html += `<td class="${colClass}">${cellValue}</td>`;
                console.log(Object.keys(data[0]))
            });

            // Retrieve lat/lng silently for map button
            const latKey = keys.find(k => k.toLowerCase() === 'latitude');
            const lonKey = keys.find(k => k.toLowerCase() === 'longitude');
            const lat = latKey ? row[latKey] : null;
            const lon = lonKey ? row[lonKey] : null;

            if (lat !== null && lon !== null && lat !== '' && lon !== '') {
                const municipality = row['Municipality'] || 'Project Location';
                html += `<td><button class="show-map-btn" style="background: none; border: none; cursor: pointer; fill: white;" onclick="window.open('map-preview.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&municipality=${encodeURIComponent(municipality)}', 'MapPopup', 'width=800,height=600,resizable=yes')"><img src="images/map2.svg" alt="Show Map" style="width: 30px; height: 30px;"></button></td>`;
            } else {
                html += '<td>N/A</td>';
            }

            html += '</tr>';
        });

        html += '</tbody></table>';
        resultsTable.innerHTML = html;
    } else {
        resultsTable.innerHTML = '<div class="empty-state"><p>No projects found matching your search.</p></div>';
    }
}

// Filters currentData by municipality search term and re-renders
function applyMunicipalityFilter() {
    const query = municipalitySearch.value.trim().toLowerCase();
    if (!query) {
        renderTable(currentData);
        return;
    }
    const filtered = currentData.filter(row => {
        const isNCR = row['Region'] === 'National Capital Region';
        const searchVal = isNCR ? (row['LegislativeDistrict'] || '') : (row['Municipality'] || '');
        return searchVal.toLowerCase().includes(query);
    });
    renderTable(filtered);
}

// Fetches filtered projects from backend
function fetchAndDisplay(field, value) {
    municipalitySearch.value = '';
    municipalitySearch.disabled = false;
    fetch(`api/flood-control.php?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
            currentData = data;
            renderTable(currentData);
        })
        .catch(err => {
            resultsTable.innerHTML = '<div class="empty-state"><p>Error fetching projects.</p></div>';
        });
}

// Municipality search input listener
municipalitySearch.addEventListener('input', applyMunicipalityFilter);

// Populates provinces dropdown based on region selection
regionSelect.addEventListener('change', () => {
    provinceSelect.innerHTML = '<option value="">Select Province</option>';
    provinceSelect.disabled = true;
    resultsTable.innerHTML = '';
    currentData = [];
    municipalitySearch.value = '';
    municipalitySearch.disabled = true;

    if (!regionSelect.value) return;

    const prefix = regionSelect.value.substring(0, 2);
    const isNCR = prefix === NCR_PREFIX;

    if (isNCR) {
        provinceSelect.innerHTML = '<option value="">Select City</option>';
        document.getElementById('provinceLabel').textContent = 'City';
        municipalityLabel.textContent = 'Search District';

        const uniqueCities = [...new Set(allProvinces
            .filter(p => p.psgc_id.substring(0, 2) === NCR_PREFIX)
            .map(p => p.name)
        )].sort();

        fetch(`api/flood-control.php?field=Region&value=National Capital Region`)
            .then(res => res.json())
            .then(data => {
                const uniqueCities = [...new Set(data.map(row => row['Province']).filter(Boolean))].sort();
                uniqueCities.forEach(city => {
                    provinceSelect.innerHTML += `<option value="${city}">${city}</option>`;
                });
                provinceSelect.disabled = false;
            })
            .catch(() => {
                resultsTable.innerHTML = '<div class="empty-state"><p>Error loading NCR cities.</p></div>';
            });
    } else {
        // Standard regions — populate provinces as usual
        provinceSelect.innerHTML = '<option value="">Select Province</option>';
        document.getElementById('provinceLabel').textContent = 'Province';
        municipalityLabel.textContent = 'Search Municipality';
        allProvinces.filter(prov => prov.psgc_id.substring(0, 2) === prefix)
            .forEach(prov => {
                provinceSelect.innerHTML += `<option value="${prov.psgc_id}">${prov.name}</option>`;
            });
        provinceSelect.disabled = false;
    }

    // Show all projects for the selected region immediately
    if (!isNCR) {
        fetchAndDisplay('Region', regionSelect.options[regionSelect.selectedIndex].text);
    }
});

provinceSelect.addEventListener('change', () => {
    resultsTable.innerHTML = '';
    currentData = [];
    municipalitySearch.value = '';
    municipalitySearch.disabled = true;

    if (!provinceSelect.value) return;

    fetchAndDisplay('Province', provinceSelect.options[provinceSelect.selectedIndex].text);
});