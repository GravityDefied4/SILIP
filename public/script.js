const regionSelect = document.getElementById('region');
const provinceSelect = document.getElementById('province');
const resultsTable = document.getElementById('resultsTable');
let allRegions = [];
let allProvinces = [];

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
        let html = '<table><thead><tr>';
        Object.keys(data[0]).forEach(key => html += `<th>${key}</th>`);
        html += '<th>Map</th>';
        html += '</tr></thead><tbody>';
        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(val => html += `<td>${val}</td>`);
            const keys = Object.keys(row);
            
            // Retrieves latitude and longitude for show map
            const latKey = keys.find(k => k.toLowerCase() === 'latitude');
            const lonKey = keys.find(k => k.toLowerCase() === 'longitude');
            const lat = latKey ? row[latKey] : null;
            const lon = lonKey ? row[lonKey] : null;
            if (lat !== null && lon !== null && lat !== '' && lon !== '') {
                
                // Show Map button
                const municipality = row['Municipality'] || 'Project Location';
                html += `<td><button class="show-map-btn" onclick="window.open('map-preview.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&municipality=${encodeURIComponent(municipality)}', 'MapPopup', 'width=800,height=600,resizable=yes')">Show Map</button></td>`;
            } else {
                html += '<td>N/A</td>';
            }
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
    fetch(`api/flood-control.php?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => renderTable(data))
        .catch(err => {
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
        allProvinces.filter(prov => prov.psgc_id.substring(0, 2) === prefix)
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