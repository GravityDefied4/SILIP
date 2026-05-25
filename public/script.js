const regionSelect = document.getElementById('region');
const provinceSelect = document.getElementById('province');
const municipalityLabel = document.getElementById('municipalityLabel');
const municipalitySearch = document.getElementById('municipalitySearch');
const resultsTable = document.getElementById('resultsTable');
let allRegions = [];
let allProvinces = [];
let ncrCities = [];
let currentData = []; // holds the last fetched dataset for client-side filtering

// pagination
const ROWS_PER_PAGE = 5;
let currentPage = 1;
let currentFiltered = [];

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
        if (!res.ok) { const err = await res.text(); throw new Error('Failed to fetch regions: ' + err); }
        return res.json();
    }),
    fetch('api/psgc.php?type=provinces').then(async res => {
        if (!res.ok) { const err = await res.text(); throw new Error('Failed to fetch provinces: ' + err); }
        return res.json();
    }),
    fetch('api/flood-control.php?field=Region&value=National Capital Region').then(res => res.json())
]).then(([regions, provinces, ncrData]) => {
    allRegions = regions;
    allProvinces = provinces;
    ncrCities = [...new Set(ncrData.map(row => row['Province']).filter(Boolean))].sort();

    // Populates region dropdown
    regions.forEach(reg => {
        regionSelect.innerHTML += `<option value="${reg.psgc_id}">${reg.name}</option>`;
    });
}).catch(err => {
    resultsTable.innerHTML = `<p style="color: red;">Error loading initial data: ${err.message}. Check browser console for details.</p>`;
});
function renderTable(data) {
    currentFiltered = data;
    currentPage = 1;
    renderPage(currentPage);
}

function renderPage(page) {
    currentPage = page;
    const data = currentFiltered;

    if (data.length === 0) {
        resultsTable.innerHTML = '<div class="empty-state"><p>No projects found matching your search.</p></div>';
        return;
    }

    const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
    const start = (page - 1) * ROWS_PER_PAGE;
    const pageData = data.slice(start, start + ROWS_PER_PAGE);

    const keys = Object.keys(data[0]);
    const visibleKeys = keys.filter(k => !['latitude', 'longitude', 'legislativedistrict'].includes(k.toLowerCase()));
    const isNCR = data[0]['Region'] === 'National Capital Region';

    let html = '<table><thead><tr>';
    visibleKeys.forEach(key => {
        let label = getDisplayName(key);
        if (isNCR && key === 'Province') label = 'City';
        if (isNCR && key === 'Municipality') label = 'District';
        html += `<th>${label}</th>`;
    });
    html += '<th>Map</th></tr></thead><tbody>';

    pageData.forEach(row => {
        html += '<tr>';
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
        });

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
    html += `<div class="pagination">
        <button onclick="renderPage(1)" ${page === 1 ? 'disabled' : ''}>«</button>
        <button onclick="renderPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹</button>
        <span>Page ${page} of ${totalPages} <small>(${data.length} projects)</small></span>
        <button onclick="renderPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>›</button>
        <button onclick="renderPage(${totalPages})" ${page === totalPages ? 'disabled' : ''}>»</button>
    </div>`;

    resultsTable.innerHTML = html;
}

// Filters currentData by municipality search term and re-renders
function applyMunicipalityFilter() {
    const query = municipalitySearch.value.trim().toLowerCase();
    if (!query) {
        currentPage = 1;
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
            currentData = data.sort((a, b) => {
            const parse = d => {
                    if (!d) return new Date(0);
                    const [m, day, y] = d.split('/');
                    return new Date(`${y}-${m}-${day}`);
                };
                return parse(a['StartDate']) - parse(b['StartDate']);
            });
            currentPage = 1;
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
        ncrCities.forEach(city => {
            provinceSelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
        provinceSelect.disabled = false;
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