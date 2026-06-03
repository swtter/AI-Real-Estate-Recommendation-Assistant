let properties = [];
let filteredProperties = [];
let map;
let markersLayer;
let markerById = new Map();

const propertyList = document.getElementById("propertyList");
const resultCount = document.getElementById("resultCount");
const filterForm = document.getElementById("filterForm");
const propertyTypeFilter = document.getElementById("propertyType");
const roomTypeFilter = document.getElementById("roomType");
const suburbFilter = document.getElementById("suburb");
const budgetFilter = document.getElementById("budget");
const budgetValue = document.getElementById("budgetValue");
const resetBtn = document.getElementById("resetBtn");

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  initMap();
  bindEvents();

  try {
    const response = await fetch("properties.json");
    properties = await response.json();
    filteredProperties = properties;
    populateSuburbOptions();
    renderProperties();
    renderMarkers();
    fitMapToProperties(filteredProperties);
  } catch (error) {
    propertyList.innerHTML = '<div class="empty-state">Could not load property data. Please run this project through a local server.</div>';
    resultCount.textContent = "No data loaded";
    console.error("Property data loading failed:", error);
  }
}

function initMap() {
  map = L.map("map").setView([-33.8688, 151.2093], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function bindEvents() {
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });

  budgetFilter.addEventListener("input", () => {
    budgetValue.textContent = `$${budgetFilter.value}`;
  });

  resetBtn.addEventListener("click", () => {
    propertyTypeFilter.value = "";
    roomTypeFilter.value = "";
    suburbFilter.value = "";
    budgetFilter.value = budgetFilter.max;
    budgetValue.textContent = `$${budgetFilter.value}`;
    applyFilters();
  });
}

function populateSuburbOptions() {
  const suburbs = [...new Set(properties.map((property) => property.suburb))].sort();

  suburbs.forEach((suburb) => {
    const option = document.createElement("option");
    option.value = suburb;
    option.textContent = suburb;
    suburbFilter.appendChild(option);
  });
}

function applyFilters() {
  const selectedPropertyType = propertyTypeFilter.value;
  const selectedRoomType = roomTypeFilter.value;
  const selectedSuburb = suburbFilter.value;
  const maxBudget = Number(budgetFilter.value);

  filteredProperties = properties.filter((property) => {
    const matchesPropertyType = !selectedPropertyType || property.propertyType === selectedPropertyType;
    const matchesRoomType = !selectedRoomType || property.roomType === selectedRoomType;
    const matchesSuburb = !selectedSuburb || property.suburb === selectedSuburb;
    const matchesBudget = property.weeklyRent <= maxBudget;

    return matchesPropertyType && matchesRoomType && matchesSuburb && matchesBudget;
  });

  renderProperties();
  renderMarkers();
  fitMapToProperties(filteredProperties);
}

function renderProperties() {
  propertyList.innerHTML = "";

  resultCount.textContent = `${filteredProperties.length} property${filteredProperties.length === 1 ? "" : "ies"} found`;

  if (filteredProperties.length === 0) {
    propertyList.innerHTML = '<div class="empty-state">No matching properties found. Try changing your filters.</div>';
    return;
  }

  filteredProperties.forEach((property) => {
    const card = document.createElement("article");
    card.className = "property-card";
    card.dataset.id = property.id;
    card.innerHTML = `
      <img src="${property.image}" alt="${property.name}">
      <div class="card-body">
        <div class="card-topline">
          <h3>${property.name}</h3>
          <span class="price">$${property.weeklyRent}/wk</span>
        </div>
        <p class="location">${property.suburb}, ${property.city}</p>
        <div class="tags">
          <span class="tag">${property.propertyType}</span>
          <span class="tag room">${property.roomType}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => focusProperty(property.id));
    propertyList.appendChild(card);
  });
}

function renderMarkers() {
  markersLayer.clearLayers();
  markerById = new Map();

  filteredProperties.forEach((property) => {
    const marker = L.marker([property.latitude, property.longitude])
      .bindPopup(`
        <p class="popup-title">${property.name}</p>
        <p class="popup-meta">$${property.weeklyRent}/wk | ${property.roomType}</p>
      `);

    marker.addTo(markersLayer);
    markerById.set(property.id, marker);
  });
}

function focusProperty(propertyId) {
  const property = properties.find((item) => item.id === propertyId);
  const marker = markerById.get(propertyId);

  if (!property || !marker) {
    return;
  }

  document.querySelectorAll(".property-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.id === propertyId);
  });

  map.setView([property.latitude, property.longitude], 15, { animate: true });
  marker.openPopup();
}

function fitMapToProperties(items) {
  if (items.length === 0) {
    map.setView([-33.8688, 151.2093], 12);
    return;
  }

  const bounds = L.latLngBounds(items.map((property) => [property.latitude, property.longitude]));
  map.fitBounds(bounds, {
    padding: [40, 40],
    maxZoom: 14
  });
}
