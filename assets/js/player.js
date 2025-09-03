import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
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

const channelsGrid = document.getElementById("channelsGrid");
const categoryBar = document.getElementById("categoryBar");
let allChannels = [];
let currentCategory = "All";

// Toast helper
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 4000);
}

// Fetch channels from Firebase
onValue(ref(db, "channels"), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    allChannels = Object.values(data);
    renderCategories(allChannels);
    renderChannels(allChannels);
  }
});

// Render categories dynamically
function renderCategories(channels) {
  const categories = ["All", ...new Set(channels.map((ch) => ch.category))];
  categoryBar.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "category-btn bg-gray-200 text-gray-700";
    if (cat === currentCategory) btn.classList.add("bg-purple-600", "text-white", "animate-pop");
    btn.onclick = () => {
      currentCategory = cat;
      document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("bg-purple-600", "text-white"));
      btn.classList.add("bg-purple-600", "text-white", "animate-pop");
      renderChannels(currentCategory === "All" ? allChannels : allChannels.filter((c) => c.category === cat));
    };
    categoryBar.appendChild(btn);
  });
}

// Render channels dynamically
function renderChannels(channels) {
  channelsGrid.innerHTML = "";
  channels.forEach((ch, i) => {
    const card = document.createElement("div");
    card.className = "channel-card animate-fadeUp relative";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <img src="${ch.icon}" alt="${ch.name}">
      <p>${ch.name}</p>
    `;

    card.onclick = (e) => {
      // Ripple effect
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // Navigate to player.html with name and stream URL
      if (ch.stream) {
        const encodedStream = encodeURIComponent(ch.stream);
        setTimeout(() => {
          window.location.href = `player.html?name=${encodeURIComponent(ch.name)}&stream=${encodedStream}`;
        }, 200);
      } else {
        showToast("Stream URL not available for this channel");
      }
    };

    channelsGrid.appendChild(card);
  });
}
