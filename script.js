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
const minBudgetFilter = document.getElementById("minBudget");
const maxBudgetFilter = document.getElementById("maxBudget");
const petFriendlyFilter = document.getElementById("petFriendly");
const schoolZoneFilter = document.getElementById("schoolZone");
const maxCommuteFilter = document.getElementById("maxCommute");
const resetBtn = document.getElementById("resetBtn");
const mapStatus = document.getElementById("mapStatus");

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  initMap();
  bindEvents();

  try {
    const response = await fetch("properties.json");
    if (!response.ok) {
      throw new Error("Property data request failed");
    }

    properties = await response.json();
    populateSuburbOptions();
    setBudgetDefaults();
    setCommuteDefault();
    applyFilters();
  } catch (error) {
    propertyList.innerHTML = '<div class="empty-state">Could not load property data. Please run this project through a local server.</div>';
    resultCount.textContent = "No data loaded";
    mapStatus.textContent = "Property data unavailable";
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

  resetBtn.addEventListener("click", () => {
    propertyTypeFilter.value = "";
    roomTypeFilter.value = "";
    suburbFilter.value = "";
    petFriendlyFilter.value = "";
    schoolZoneFilter.value = "";
    setBudgetDefaults();
    setCommuteDefault();
    applyFilters();
  });
}

function populateSuburbOptions() {
  suburbFilter.innerHTML = '<option value="">Any suburb</option>';
  const suburbs = [...new Set(properties.map((property) => property.suburb))].sort();

  suburbs.forEach((suburb) => {
    const option = document.createElement("option");
    option.value = suburb;
    option.textContent = suburb;
    suburbFilter.appendChild(option);
  });
}

function setBudgetDefaults() {
  const rents = properties.map((property) => property.weeklyRent);
  const minRent = Math.floor(Math.min(...rents) / 50) * 50;
  const maxRent = Math.ceil(Math.max(...rents) / 50) * 50;

  minBudgetFilter.min = minRent;
  minBudgetFilter.max = maxRent;
  minBudgetFilter.value = minRent;
  maxBudgetFilter.min = minRent;
  maxBudgetFilter.max = maxRent;
  maxBudgetFilter.value = maxRent;
}

function setCommuteDefault() {
  const longestCommute = Math.max(...properties.map((property) => property.commuteTime));
  maxCommuteFilter.max = Math.ceil(longestCommute / 5) * 5;
  maxCommuteFilter.value = maxCommuteFilter.max;
}

function applyFilters() {
  const preferences = getPreferences();

  filteredProperties = properties
    .map((property) => ({
      ...property,
      matchScore: calculateMatchScore(property, preferences),
      matchExplanation: buildMatchExplanation(property, preferences)
    }))
    .filter((property) => isVisibleMatch(property, preferences))
    .sort((a, b) => b.matchScore - a.matchScore || a.weeklyRent - b.weeklyRent);

  renderProperties();
  renderMarkers();
  fitMapToProperties(filteredProperties);
}

function getPreferences() {
  let minBudget = Number(minBudgetFilter.value);
  let maxBudget = Number(maxBudgetFilter.value);

  if (minBudget > maxBudget) {
    [minBudget, maxBudget] = [maxBudget, minBudget];
    minBudgetFilter.value = minBudget;
    maxBudgetFilter.value = maxBudget;
  }

  return {
    propertyType: propertyTypeFilter.value,
    roomType: roomTypeFilter.value,
    suburb: suburbFilter.value,
    minBudget,
    maxBudget,
    petFriendly: petFriendlyFilter.value,
    schoolZone: schoolZoneFilter.value,
    maxCommute: Number(maxCommuteFilter.value)
  };
}

function isVisibleMatch(property, preferences) {
  const matchesPropertyType = !preferences.propertyType || property.propertyType === preferences.propertyType;
  const matchesRoomType = !preferences.roomType || property.roomType === preferences.roomType;
  const matchesSuburb = !preferences.suburb || property.suburb === preferences.suburb;
  const matchesBudget = property.weeklyRent >= preferences.minBudget && property.weeklyRent <= preferences.maxBudget;
  const matchesPet = !preferences.petFriendly || property.petFriendly === preferences.petFriendly;
  const matchesSchool = !preferences.schoolZone || property.schoolZone === preferences.schoolZone;
  const matchesCommute = property.commuteTime <= preferences.maxCommute;

  return matchesPropertyType && matchesRoomType && matchesSuburb && matchesBudget && matchesPet && matchesSchool && matchesCommute;
}

function calculateMatchScore(property, preferences) {
  const budgetScore = getBudgetScore(property.weeklyRent, preferences.minBudget, preferences.maxBudget);
  const commuteScore = getCommuteScore(property.commuteTime, preferences.maxCommute);
  const scores = [
    { weight: budgetScore, matched: true },
    { weight: 15, matched: !preferences.propertyType || property.propertyType === preferences.propertyType },
    { weight: 15, matched: !preferences.roomType || property.roomType === preferences.roomType },
    { weight: 10, matched: !preferences.suburb || property.suburb === preferences.suburb },
    { weight: 10, matched: !preferences.petFriendly || property.petFriendly === preferences.petFriendly },
    { weight: 10, matched: !preferences.schoolZone || property.schoolZone === preferences.schoolZone },
    { weight: commuteScore, matched: true }
  ];

  return scores.reduce((total, item) => total + (item.matched ? item.weight : 0), 0);
}

function getBudgetScore(rent, minBudget, maxBudget) {
  if (rent < minBudget || rent > maxBudget) {
    return 0;
  }

  const range = Math.max(maxBudget - minBudget, 1);
  const position = (rent - minBudget) / range;
  return Math.round(15 + (1 - position) * 10);
}

function getCommuteScore(commuteTime, maxCommute) {
  if (commuteTime > maxCommute) {
    return 0;
  }

  const commuteRatio = commuteTime / Math.max(maxCommute, 1);
  return Math.round(5 + (1 - commuteRatio) * 10);
}

function buildMatchExplanation(property, preferences) {
  const reasons = [];

  if (property.weeklyRent >= preferences.minBudget && property.weeklyRent <= preferences.maxBudget) {
    reasons.push("budget");
  }
  if (preferences.roomType && property.roomType === preferences.roomType) {
    reasons.push("room type");
  }
  if (preferences.propertyType && property.propertyType === preferences.propertyType) {
    reasons.push("property type");
  }
  if (preferences.suburb && property.suburb === preferences.suburb) {
    reasons.push("location");
  }
  if (preferences.petFriendly && property.petFriendly === preferences.petFriendly) {
    reasons.push("pet preference");
  }
  if (preferences.schoolZone && property.schoolZone === preferences.schoolZone) {
    reasons.push("school zone");
  }
  if (property.commuteTime <= preferences.maxCommute) {
    reasons.push("commute");
  }

  const topReasons = reasons.slice(0, 3);

  if (topReasons.length === 0) {
    return "Potential match based on the current search settings.";
  }

  return `Good match for your ${formatReasonList(topReasons)} preference${topReasons.length === 1 ? "" : "s"}.`;
}

function formatReasonList(items) {
  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items[0]}, ${items[1]}, and ${items[2]}`;
}

function renderProperties() {
  propertyList.innerHTML = "";

  resultCount.textContent = `${filteredProperties.length} recommended propert${filteredProperties.length === 1 ? "y" : "ies"} found`;
  mapStatus.textContent = `${filteredProperties.length} marker${filteredProperties.length === 1 ? "" : "s"} shown by match score`;

  if (filteredProperties.length === 0) {
    propertyList.innerHTML = '<div class="empty-state">No matching properties found. Try changing your recommendation filters.</div>';
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
          <span class="price">${formatRent(property.weeklyRent)}</span>
        </div>
        <p class="location">${property.suburb}</p>
        <div class="score-row">
          <span class="match-score">Match Score: ${property.matchScore}%</span>
          <span class="commute">${property.commuteTime} min commute</span>
        </div>
        <p class="description">${property.shortDescription}</p>
        <div class="tags">
          <span class="tag">${property.propertyType}</span>
          <span class="tag room">${property.roomType}</span>
          <span class="tag">${property.bedrooms} bed</span>
          <span class="tag">${property.bathrooms} bath</span>
          <span class="tag">${property.parking} parking</span>
          <span class="tag">Pet: ${property.petFriendly}</span>
          <span class="tag">School: ${property.schoolZone}</span>
        </div>
        <p class="explanation">${property.matchExplanation}</p>
      </div>
    `;

    card.addEventListener("click", () => focusProperty(property.id, true));
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
        <p class="popup-meta">${formatRent(property.weeklyRent)} | ${property.roomType} | ${property.matchScore}% match</p>
      `);

    marker.on("click", () => {
      activatePropertyCard(property.id, true);
    });

    marker.addTo(markersLayer);
    markerById.set(property.id, marker);
  });
}

function focusProperty(propertyId, moveMap) {
  const property = filteredProperties.find((item) => item.id === propertyId);
  const marker = markerById.get(propertyId);

  if (!property || !marker) {
    return;
  }

  activatePropertyCard(propertyId, false);

  if (moveMap) {
    map.setView([property.latitude, property.longitude], 15, { animate: true });
  }

  marker.openPopup();
}

function activatePropertyCard(propertyId, scrollToCard) {
  document.querySelectorAll(".property-card").forEach((card) => {
    const isActive = card.dataset.id === propertyId;
    card.classList.toggle("active", isActive);

    if (isActive && scrollToCard) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
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

function formatRent(value) {
  return `$${value.toLocaleString()}/wk`;
}
