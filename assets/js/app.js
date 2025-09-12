// app.js

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
const searchInput = document.getElementById("searchInput");

// State
let selectedCategory = "All"; // default is All
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let users = {}; // store admins & users info

// Skeleton loader
grid.innerHTML = '<div class="skeleton"></div>'.repeat(12);

// Favorite toggle
function toggleFavorite(channel, favBtn) {
  const exists = favorites.some((fav) => fav.src === channel.src);
  if (exists) {
    favorites = favorites.filter((fav) => fav.src !== channel.src);
  } else {
    favorites.push(channel);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  favBtn.innerHTML = `<i class="material-icons">${exists ? "favorite_border" : "favorite"}</i>`;
}

// Show Info Modal
function showInfoModal(channel) {
  let modal = document.getElementById("infoModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className =
      "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 hidden";
    modal.innerHTML = `
      <div class="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl max-w-md w-full text-white shadow-xl border border-white/10 glass">
        <h2 class="text-2xl font-bold mb-4" id="infoTitle"></h2>
        <img id="infoThumb" class="w-full rounded-lg mb-4 shadow" alt="Channel thumbnail"/>
        <div class="space-y-2 text-sm">
          <p><strong>Name:</strong> <span id="infoName"></span></p>
          <p><strong>Category:</strong> <span id="infoCategory"></span></p>
          <p><strong>Language:</strong> <span id="infoLanguage"></span></p>
          <p><strong>Tags:</strong> <span id="infoTags"></span></p>
          <p><strong>Added By:</strong> <span id="infoAddedBy"></span></p>
        </div>
        <div class="text-right mt-5">
          <button id="closeInfo" class="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#closeInfo").onclick = () => {
      modal.classList.add("hidden");
    };
  }

  // fill fields
  modal.querySelector("#infoTitle").textContent = channel.name;
  modal.querySelector("#infoThumb").src = channel.logo;
  modal.querySelector("#infoName").textContent = channel.name;
  modal.querySelector("#infoCategory").textContent = channel.category;
  modal.querySelector("#infoLanguage").textContent = channel.category;
  modal.querySelector("#infoTags").textContent = channel.tags || "—";

  // fetch added by from users node
  let addedBy = "Unknown";
  if (channel.addedBy && users[channel.addedBy]) {
    addedBy = users[channel.addedBy].name || channel.addedBy;
  }
  modal.querySelector("#infoAddedBy").textContent = addedBy;

  modal.classList.remove("hidden");
}

// Create Channel Card
function createChannelCard(c) {
  const a = document.createElement("a");
  a.href = `player?stream=${encodeURIComponent(
    c.name.toLowerCase().replace(/\s+/g, "-")
  )}`;
  a.className = "channel-card";
  a.setAttribute("aria-label", `Watch ${c.name}`);
  a.tabIndex = 0;

  const img = document.createElement("img");
  img.src = c.logo;
  img.alt = c.name + " logo";
  img.className = "channel-image";

  const overlay = document.createElement("div");
  overlay.className = "channel-overlay";
  overlay.innerHTML = `▶ Watch<br><small>${c.category}</small>`;

  const nameDiv = document.createElement("div");
  nameDiv.className = "channel-name";
  nameDiv.textContent = c.name;

  const liveBadge = document.createElement("div");
  liveBadge.className = "live-badge";
  liveBadge.textContent = "LIVE";

  // Favorite button (comes first)
  const favBtn = document.createElement("div");
  favBtn.className = "favorite-btn";
  favBtn.style.right = "44px"; // right-most
  const isFav = favorites.some((fav) => fav.src === c.src);
  favBtn.innerHTML = `<i class="material-icons">${isFav ? "favorite" : "favorite_border"}</i>`;
  favBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const favObj = {
      title: c.name,
      src: c.src,
      thumb: c.logo,
      category: c.category,
    };
    toggleFavorite(favObj, favBtn);
  };

  // Info button (comes next)
  const infoBtn = document.createElement("div");
  infoBtn.className = "favorite-btn";
  infoBtn.style.right = "4px"; // next to favorite
  infoBtn.innerHTML = `<i class="material-icons">info</i>`;
  infoBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showInfoModal(c);
  };

  // Append elements in correct order
  a.appendChild(img);
  a.appendChild(overlay);
  a.appendChild(nameDiv);
  a.appendChild(liveBadge);
  a.appendChild(favBtn);  // favorite first
  a.appendChild(infoBtn); // info next

  return a;
}

// Render Categories
function renderCategories() {
  const fixedCats = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi"];
  const allCats = [...new Set(channels.map((c) => c.category))];

  // ensure custom order, new cats after Hindi
  const cats = fixedCats.concat(allCats.filter((c) => !fixedCats.includes(c)));

  // prepend "All" category
  const finalCats = ["All", ...cats];

  categoryBar.innerHTML = "";
  finalCats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-btn" + (cat === selectedCategory ? " active" : "");
    btn.textContent = `${cat} (${
      cat === "All" ? channels.length : channels.filter((c) => c.category === cat).length
    })`;
    btn.onclick = () => {
      selectedCategory = cat;
      renderCategories();
      renderChannels(searchInput.value);
      btn.scrollIntoView({ behavior: "smooth", inline: "center" });
    };
    categoryBar.appendChild(btn);
  });
}

// Render Channels
function renderChannels(filter = "") {
  grid.innerHTML = "";
  const filtered = channels.filter(
    (c) =>
      (selectedCategory === "All" || c.category === selectedCategory) &&
      c.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (!filtered.length) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:#9ca3af;padding:1rem;">No channels found</p>';
    return;
  }
  filtered.forEach((c, i) => {
    const card = createChannelCard(c);
    grid.appendChild(card);
    setTimeout(() => card.classList.add("show"), i * 80);
  });
}

// Render Featured
function renderFeatured() {
  featuredCarousel.innerHTML = "";
  const featured = channels.slice(0, 10);
  featured.forEach((c) => {
    const card = document.createElement("div");
    card.className = "featured-card";
    card.innerHTML = `
      <img src="${c.logo}" alt="${c.name}">
      <div class="featured-overlay">${c.name}</div>`;
    card.onclick = () =>
      (window.location.href = `player?stream=${encodeURIComponent(
        c.name.toLowerCase().replace(/\s+/g, "-")
      )}`);
    featuredCarousel.appendChild(card);
  });
}

// Search
searchInput.addEventListener("input", (e) => renderChannels(e.target.value));

// Firebase Fetch Channels
onValue(ref(db, "channels"), (snapshot) => {
  if (snapshot.exists()) {
    channels = Object.values(snapshot.val()).map((c) => ({
      name: c.name,
      category: c.category,
      logo: c.icon,
      src: c.stream,
      tags: c.tags || "",
      addedBy: c.addedBy || null,
    }));
    renderFeatured();
    renderCategories();
    renderChannels(searchInput.value);
  } else {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:#9ca3af;padding:1rem;">No channels available.</p>';
  }
});

// Firebase Fetch Users/Admins
onValue(ref(db, "admins&users"), (snapshot) => {
  if (snapshot.exists()) {
    users = snapshot.val();
  }
});

// Fade-in body after load
window.addEventListener("load", () => document.body.classList.add("loaded"));