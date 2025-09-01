// assets/js/player.js
console.log("✅ player.js loaded");

// --- Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

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

// --- Animations ---
const style = document.createElement('style');
style.innerHTML = `
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
.animate-ripple { animation: ripple 0.5s linear; }

@keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
.animate-pop { animation: pop 0.35s ease-out forwards; }

@keyframes slideDown { 0% { transform: translateY(-20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.animate-slideDown { animation: slideDown 0.5s ease-out forwards; }

@keyframes fadeUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.animate-fadeUp { animation: fadeUp 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

// --- Globals ---
const categories = ["All", "Entertainment", "Music", "News"];
let selectedCategory = "All";
let channelsData = [];

// --- Render Categories ---
function renderCategories() {
  const row = document.getElementById('categoriesRow');
  if (!row) {
    console.error("❌ categoriesRow not found in DOM");
    return;
  }
  row.innerHTML = '';
  row.classList.add('animate-slideDown');

  categories.forEach((cat, i) => {
    const btn = document.createElement('a');
    btn.textContent = cat;
    btn.href = "#";
    btn.className = `px-5 py-2 rounded-full whitespace-nowrap transform transition-all duration-200 shadow-sm opacity-0 ${
      selectedCategory === cat 
        ? 'bg-white text-red-600 font-bold' 
        : 'bg-gray-200/50 text-gray-900 hover:bg-white hover:text-red-600 hover:scale-105'
    }`;

    btn.style.animation = `slideDown 0.5s ease-out forwards`;
    btn.style.animationDelay = `${i * 80}ms`;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedCategory = cat;
      renderCategories();
      renderChannels();
    });

    row.appendChild(btn);
  });
}

// --- Render Channels ---
function renderChannels() {
  const grid = document.getElementById('channelsGrid');
  if (!grid) {
    console.error("❌ channelsGrid not found in DOM");
    return;
  }

  grid.className = "grid grid-cols-3 gap-4 p-4"; // 3 per row, equal spacing
  grid.innerHTML = '';
  
  const filtered = channelsData.filter(
    c => selectedCategory === "All" || c.category === selectedCategory
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="col-span-3 text-center text-gray-500">No channels found</p>`;
    return;
  }

  filtered.forEach((channel, index) => {
    const div = document.createElement('div');
    div.className =
      'flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 animate-fadeUp animate-pop';
    div.style.animationDelay = `${index * 80}ms`;
    div.innerHTML = `
      <div class="w-full aspect-square bg-white rounded-xl shadow-md flex items-center justify-center p-4">
        <img src="${channel.icon}" alt="${channel.name}" 
             class="w-20 h-20 object-contain"/>
      </div>
      <span class="text-base font-bold text-gray-900 text-center select-none w-full px-1 mt-2 leading-tight">
        ${channel.name}
      </span>
    `;
    div.addEventListener('click', () => {
      const nameParam = encodeURIComponent(channel.name);
      window.location.href = \`https://ppsmrt.github.io/tv/player.html?name=\${nameParam}\`;
    });
    grid.appendChild(div);
  });
}

// --- Load Channels from Firebase ---
function loadChannels() {
  try {
    const channelsRef = ref(db, "channels"); // expects channels stored at /channels
    console.log("📡 Listening to Firebase...");
    onValue(channelsRef, (snapshot) => {
      if (snapshot.exists()) {
        channelsData = Object.values(snapshot.val());
        console.log("✅ Channels loaded:", channelsData.length);
        renderCategories();
        renderChannels();
      } else {
        console.warn("⚠️ No channels found in Firebase");
        const grid = document.getElementById('channelsGrid');
        if (grid) {
          grid.innerHTML = `<p class="col-span-3 text-center text-gray-500">No channels found</p>`;
        }
      }
    }, (err) => {
      console.error("❌ Firebase error:", err);
    });
  } catch (err) {
    console.error("❌ Failed to load from Firebase:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadChannels);