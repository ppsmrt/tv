import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb",
  measurementId: "G-FNS9JWZ9LS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM Elements
const grid = document.getElementById("channelsGrid");
const categoryBar = document.getElementById("categoryBar");
const featuredCarousel = document.getElementById("featuredCarousel");
const recentlyAddedCarousel = document.getElementById("recentlyAddedCarousel");
const searchInput = document.getElementById("searchInput");

let selectedCategory = "All";
let channels = [];

// Create channel card
function createChannelCard(c) {
  const card = document.createElement("div");
  card.className = "featured-card relative";

  const img = document.createElement("img");
  img.src = c.logo;
  img.alt = c.name;

  const overlay = document.createElement("div");
  overlay.className = "featured-overlay";
  overlay.textContent = c.name;

  card.appendChild(img);
  card.appendChild(overlay);

  card.onclick = () => {
    window.location.href = `player?stream=${encodeURIComponent(
      c.name.toLowerCase().replace(/\s+/g, "-")
    )}`;
  };

  return card;
}

// Render Featured
function renderFeatured() {
  featuredCarousel.innerHTML = "";
  const featured = channels.slice(0, 10);
  featured.forEach(c => featuredCarousel.appendChild(createChannelCard(c)));
}

// Render Recently Added (last 24h)
function renderRecentlyAdded() {
  recentlyAddedCarousel.innerHTML = "";
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const recent = channels
    .filter(c => c.addedAt && (Date.now() - new Date(c.addedAt).getTime() < ONE_DAY))
    .filter(c => selectedCategory === "All" || c.category === selectedCategory)
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

  if (!recent.length) {
    recentlyAddedCarousel.innerHTML =
      '<p style="color:#9ca3af;padding:1rem;">No recently added channels.</p>';
    return;
  }

  recent.forEach(c => {
    const card = createChannelCard(c);
    const badge = document.createElement("div");
    badge.className = "recent-badge";
    badge.textContent = "NEW";
    card.appendChild(badge);
    recentlyAddedCarousel.appendChild(card);
  });
}

// Render Category Bar
function renderCategories() {
  const fixedCats = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi"];
  const allCats = [...new Set(channels.map(c => c.category))];
  const cats = fixedCats.concat(allCats.filter(c => !fixedCats.includes(c)));
  const finalCats = ["All", ...cats];

  categoryBar.innerHTML = "";
  finalCats.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn" + (cat === selectedCategory ? " active" : "");
    btn.textContent = `${cat} (${cat === "All" ? channels.length : channels.filter(c => c.category === cat).length})`;
    btn.onclick = () => {
      selectedCategory = cat;
      renderCategories();
      renderRecentlyAdded();
      renderChannels(searchInput.value);
    };
    categoryBar.appendChild(btn);
  });
}

// Render Channels Grid
function renderChannels(filter = "") {
  grid.innerHTML = "";
  const filtered = channels
    .filter(c => (selectedCategory === "All" || c.category === selectedCategory)
      && c.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!filtered.length) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:#9ca3af;padding:1rem;">No channels found</p>';
    return;
  }
  filtered.forEach(c => grid.appendChild(createChannelCard(c)));
}

// Search Input
searchInput.addEventListener("input", e => renderChannels(e.target.value));

// Firebase Fetch Channels
onValue(ref(db, "channels"), snapshot => {
  if (snapshot.exists()) {
    channels = Object.values(snapshot.val()).map(c => ({
      name: c.name,
      category: c.category,
      logo: c.icon,
      src: c.stream,
      addedAt: c.createdAt || new Date().toISOString()
    }));

    renderFeatured();
    renderCategories();
    renderRecentlyAdded();
    renderChannels();
  }
});