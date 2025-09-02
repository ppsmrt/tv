import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
let channels = [];

function createChannelCard(c) {
  const a = document.createElement('a');
  const safeName = encodeURIComponent(c.name.toLowerCase().replace(/\s+/g,'-'));
  a.href = `test.html?stream=${safeName}`;
  a.className = 'channel-card';
  a.setAttribute('aria-label', `Watch ${c.name}`);

  const img = document.createElement('img');
  img.src = c.logo; img.alt = c.name + ' logo'; img.className = 'channel-image';

  const overlay = document.createElement('div');
  overlay.className = 'channel-overlay';
  overlay.textContent = '▶ Watch';

  const nameDiv = document.createElement('div');
  nameDiv.className = 'channel-name';
  nameDiv.textContent = c.name;

  a.appendChild(img); a.appendChild(overlay); a.appendChild(nameDiv);
  return a;
}

function renderChannels(filter='') {
  const selectedCategory = window.selectedCategory || 'All';
  grid.innerHTML = '';
  const filtered = channels.filter(c => {
    const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchSearch = c.name.toLowerCase().includes(filter.toLowerCase());
    return matchCat && matchSearch;
  });
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:#9ca3af; padding:1rem; text-align:center;">No channels found.</p>';
    return;
  }
  filtered.forEach((c, i) => {
    const card = createChannelCard(c);
    grid.appendChild(card);
    setTimeout(() => card.classList.add('show'), i * 100);
  });
}

// Listen for filter events
window.addEventListener('filterChanged', e => renderChannels(e.detail));

// Firebase channels
const channelsRef = ref(db, 'channels');
onValue(channelsRef, snapshot => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    channels = Object.values(data).map(c => ({
      name: c.name,
      category: c.category,
      logo: c.icon,
      stream: c.stream
    }));
    renderChannels('');
  } else {
    grid.innerHTML = '<p style="color:#9ca3af; padding:1rem; text-align:center;">No channels available.</p>';
  }
});