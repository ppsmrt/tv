import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

window.addEventListener("load", () => document.body.classList.add("loaded"));

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

const grid = document.getElementById('channelsGrid');
const categoryBar = document.getElementById('categoryBar');
const searchInput = document.getElementById('searchInput');

let selectedCategory = 'All';
let channels = [];

// Skeleton loader while data loads
grid.innerHTML = '<div class="skeleton"></div>'.repeat(12);

// Create channel card
function createChannelCard(c) {
  const a = document.createElement('a');
  const safeName = encodeURIComponent(c.name.toLowerCase().replace(/\s+/g,'-'));
  a.href = `player?stream=${safeName}`;
  a.className = 'channel-card';
  a.setAttribute('aria-label', `Watch ${c.name}`);
  a.tabIndex = 0;

  const img = document.createElement('img');
  img.src = c.logo;
  img.alt = c.name + ' logo';
  img.className = 'channel-image';

  const overlay = document.createElement('div');
  overlay.className = 'channel-overlay';
  overlay.innerHTML = `▶ Watch<br><small>${c.category}</small>`;

  const nameDiv = document.createElement('div');
  nameDiv.className = 'channel-name';
  nameDiv.textContent = c.name;

  const liveBadge = document.createElement('div');
  liveBadge.className = 'live-badge';
  liveBadge.textContent = 'LIVE';

  a.appendChild(img);
  a.appendChild(overlay);
  a.appendChild(nameDiv);
  a.appendChild(liveBadge);

  return a;
}

// Render categories
function renderCategories() {
  const categories = ['All', ...new Set(channels.map(c => c.category))];
  categories.sort();
  categoryBar.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-btn ${cat === selectedCategory ? 'active' : ''}`;
    btn.dataset.category = cat;
    btn.setAttribute('aria-pressed', cat === selectedCategory ? 'true' : 'false');

    const count = cat === 'All'
      ? channels.length
      : channels.filter(c => c.category === cat).length;

    const label = document.createElement('span');
    label.textContent = cat;

    const badge = document.createElement('span');
    badge.className = 'category-count';
    badge.textContent = count;

    btn.appendChild(label);
    btn.appendChild(badge);

    btn.addEventListener('click', () => {
      selectedCategory = cat;
      renderCategories();
      renderChannels(searchInput.value);
      btn.scrollIntoView({ behavior: "smooth", inline: "center" });
    });

    categoryBar.appendChild(btn);
  });
}

// Render channels
function renderChannels(filter = '') {
  grid.innerHTML = '';
  const filtered = channels.filter(c => {
    const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchSearch = c.name.toLowerCase().includes(filter.toLowerCase());
    return matchCat && matchSearch;
  });

  filtered.sort((a,b) => a.name.localeCompare(b.name));

  if(filtered.length === 0){
    grid.innerHTML = '<p style="color:#9ca3af; padding:1rem; text-align:center;">No channels found.</p>';
    return;
  }

  filtered.forEach((c,i)=>{
    const card = createChannelCard(c);
    grid.appendChild(card);
    setTimeout(()=>card.classList.add('show'), i*80);
  });
}

// Search input
searchInput.addEventListener('input', e => renderChannels(e.target.value));

// Firebase channels listener
const channelsRef = ref(db,'channels');
onValue(channelsRef, snapshot=>{
  if(snapshot.exists()){
    const data = snapshot.val();
    channels = Object.values(data).map(c=>({
      name:c.name,
      category:c.category,
      logo:c.icon,
      stream:c.stream
    }));
    renderCategories();
    renderChannels(searchInput.value);
  } else {
    grid.innerHTML = '<p style="color:#9ca3af; padding:1rem; text-align:center;">No channels available.</p>';
  }
});