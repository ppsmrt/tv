import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');

const addFavBtn = document.getElementById('addFav');
const removeFavBtn = document.getElementById('removeFav');

const channelListBtn = document.getElementById("channelListBtn");
const channelListModal = document.getElementById("channelListModal");
const closeChannelList = document.getElementById("closeChannelList");
const channelListDiv = document.getElementById("channelList");

const pipBtn = document.getElementById("pipBtn");
const themeBtn = document.getElementById("themeBtn");
const premiumBtn = document.getElementById("premiumBtn");

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let channelsList = [];
let currentIndex = -1;
let controlsTimeout, scale = 1, initialDistance = null;

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Query string
function qs(name) {
  return new URL(location.href).searchParams.get(name);
}
let streamSlug = qs('stream');
if (streamSlug) streamSlug = streamSlug.replace(/-/g, ' ').toLowerCase();

// Load channels
const channelsRef = ref(db, 'channels');
get(channelsRef).then(snapshot => {
  if (snapshot.exists()) {
    channelsList = [];
    snapshot.forEach(childSnap => channelsList.push(childSnap.val()));
    channelsList = channelsList.map(c => ({ ...c, slug: c.name.toLowerCase() }));
    currentIndex = channelsList.findIndex(c => c.slug === streamSlug);
    if (currentIndex !== -1) loadChannel(currentIndex);
  }
});

// Load channel
function loadChannel(index) {
  if (index < 0 || index >= channelsList.length) return;
  const channel = channelsList[index];
  video.src = channel.stream;
  videoTitle.textContent = channel.name || "Live Stream";
  localStorage.setItem("selectedVideo", channel.stream);
  localStorage.setItem("selectedVideoTitle", channel.name || "Live Stream");
  video.load();
  video.play().catch(() => {});
  currentIndex = index;
  updateFavButtons();
}

// Play/Pause
playBtn.addEventListener('click', () => {
  if (video.paused) { video.play(); playBtn.textContent = 'pause'; }
  else { video.pause(); playBtn.textContent = 'play_arrow'; }
});

// Fullscreen
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    video.parentElement.requestFullscreen?.({ navigationUI: 'hide' });
    screen.orientation?.lock('landscape').catch(() => {});
  } else {
    document.exitFullscreen(); screen.orientation?.unlock?.();
  }
});

// Volume
muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});
volumeSlider.addEventListener('input', () => {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});

// Controls auto-hide
function showControls() {
  controls.classList.remove('hidden');
  clearTimeout(controlsTimeout);
  if (window.matchMedia("(orientation: landscape)").matches) {
    controlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
  }
}
video.addEventListener('mousemove', showControls);
video.addEventListener('touchstart', showControls);

// Favorites
function updateFavButtons() {
  const videoSrc = localStorage.getItem('selectedVideo');
  const isFav = favorites.some(f => f.src === videoSrc);
  if (isFav) { addFavBtn.classList.add('hidden'); removeFavBtn.classList.remove('hidden'); }
  else { addFavBtn.classList.remove('hidden'); removeFavBtn.classList.add('hidden'); }
}
addFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  const title = localStorage.getItem('selectedVideoTitle') || 'Unknown';
  favorites.push({ title, src: videoSrc });
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});
removeFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  favorites = favorites.filter(f => f.src !== videoSrc);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

// ===== PREMIUM FEATURES =====
// Channel List
function renderChannelList() {
  channelListDiv.innerHTML = "";
  channelsList.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600";
    btn.textContent = c.name;
    btn.onclick = () => { loadChannel(i); channelListModal.classList.add("hidden"); };
    channelListDiv.appendChild(btn);
  });
}
channelListBtn.addEventListener("click", () => { renderChannelList(); channelListModal.classList.remove("hidden"); });
closeChannelList.addEventListener("click", () => { channelListModal.classList.add("hidden"); });

// PiP
pipBtn.addEventListener("click", async () => {
  if (document.pictureInPictureElement) document.exitPictureInPicture();
  else { try { await video.requestPictureInPicture(); } catch (e) {} }
});

// Themes
let theme = localStorage.getItem("theme") || "dark";
function applyTheme(mode) {
  if (mode === "dark") document.body.className = "bg-gray-900 text-white";
  else if (mode === "neon") document.body.className = "bg-black text-cyan-400";
  else if (mode === "minimal") document.body.className = "bg-white text-black";
}
themeBtn.addEventListener("click", () => {
  theme = theme === "dark" ? "neon" : theme === "neon" ? "minimal" : "dark";
  localStorage.setItem("theme", theme); applyTheme(theme);
});
applyTheme(theme);

// Premium toggle
let premium = localStorage.getItem("premium") === "true";
function applyPremium() {
  document.querySelector(".ad-strip")?.style.setProperty("display", premium ? "none" : "");
  document.querySelector(".animate-scroll")?.style.setProperty("display", premium ? "none" : "");
  premiumBtn.classList.toggle("text-green-400", premium);
}
premiumBtn.addEventListener("click", () => {
  premium = !premium; localStorage.setItem("premium", premium); applyPremium();
});
applyPremium();