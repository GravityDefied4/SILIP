// frontend/js/app.js

// =========================
// LEAFLET MAP
// =========================

const map = L.map('map').setView([12.8797, 121.7740], 6);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);

// Marker storage
let markers = [];

// =========================
// HTML ELEMENTS
// =========================

const searchButton = document.getElementById("searchButton");

const searchInput = document.getElementById("searchInput");

const projectsContainer =
    document.getElementById("projectsContainer");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

// =========================
// SEARCH FUNCTION
// =========================

async function searchProjects() {

    const location = searchInput.value.trim();

    if(location === "") {

        alert("Please enter a location.");

        return;
    }

    // Reset UI
    projectsContainer.innerHTML = "";

    emptyState.classList.add("d-none");

    loading.classList.remove("d-none");

    // Remove previous markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });

    markers = [];

    try {

        /*
            Example PHP fetch

            Your PHP should accept:
            ?location=VALUE

            Example:
            flood-control.php?location=dagupan
        */

        const response = await fetch(
            `../src/flood-control.php?location=${location}`
        );

        const data = await response.json();

        loading.classList.add("d-none");

        // No results
        if(data.length === 0) {

            projectsContainer.innerHTML = `
                <div class="col-12">

                    <div class="empty-state">

                        <h5>
                            No flood control projects found.
                        </h5>

                    </div>

                </div>
            `;

            return;
        }

        // Add projects
        data.forEach(project => {

            // =========================
            // PROJECT CARD
            // =========================

            const card = document.createElement("div");

            card.classList.add(
                "col-md-6",
                "col-lg-4",
                "mt-4"
            );

            card.innerHTML = `
                <div class="project-card shadow-sm">

                    <h5 class="fw-bold">
                        ${project.project_name}
                    </h5>

                    <p class="text-muted">
                        ${project.location}
                    </p>

                    <hr>

                    <p>
                        <strong>Budget:</strong>
                        ${project.amount}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${project.status}
                    </p>

                    <p>
                        <strong>Agency:</strong>
                        ${project.agency}
                    </p>

                </div>
            `;

            projectsContainer.appendChild(card);

            // =========================
            // MAP MARKERS
            // =========================

            if(project.latitude && project.longitude) {

                const marker = L.marker([
                    project.latitude,
                    project.longitude
                ])
                .addTo(map)
                .bindPopup(`
                    <b>${project.project_name}</b><br>
                    ${project.location}
                `);

                markers.push(marker);
            }

        });

        // Focus map to first result
        if(data[0].latitude && data[0].longitude) {

            map.setView([
                data[0].latitude,
                data[0].longitude
            ], 11);
        }

    }
    catch(error) {

        loading.classList.add("d-none");

        console.error(error);

        projectsContainer.innerHTML = `
            <div class="col-12">

                <div class="empty-state">

                    <h5>
                        Error fetching data from server.
                    </h5>

                </div>

            </div>
        `;
    }
}

// =========================
// EVENTS
// =========================

searchButton.addEventListener(
    "click",
    searchProjects
);

searchInput.addEventListener(
    "keypress",
    function(event) {

        if(event.key === "Enter") {

            searchProjects();
        }
    }
);