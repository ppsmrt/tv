// Load JSON Playlist
async function fetchPlaylist() {
  const response = await fetch('playlist.json');
  return await response.json();
}

let playlist = [];
let currentIndex = 0;
const loader = document.getElementById('loader');
const playerEl = document.getElementById('player');
const player = new Plyr(playerEl, { controls: [] });
const tickerEl = document.getElementById('ticker');
const adBar = document.getElementById('adBar');
const controls = document.getElementById('customControls');
const playPauseBtn = document.getElementById('playPause').querySelector("i");

// Load video
function loadVideo(index) {
  const item = playlist[index];
  loader.style.display = 'block';
  player.source = {
    type: 'video',
    sources: [{ src: item.url, type: 'video/mp4' }]
  };
  player.play().catch(() => {});
  player.once('ready', () => loader.style.display = 'none');
  player.on('ended', nextVideo);

  // Update ticker
  updateTicker(item.title);
}

function nextVideo() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadVideo(currentIndex);
}

// Custom Play/Pause Toggle
document.getElementById('playPause').addEventListener('click', () => {
  if (player.playing) {
    player.pause();
    playPauseBtn.className = "fas fa-play";
  } else {
    player.play();
    playPauseBtn.className = "fas fa-pause";
  }
});

// Fullscreen
document.getElementById('fullscreenBtn').addEventListener('click', () => {
  player.fullscreen.enter();
});

// Orientation Change (simulated rotate)
document.getElementById('orientationBtn').addEventListener('click', () => {
  if (screen.orientation) {
    let type = screen.orientation.type.startsWith("landscape") ? "portrait" : "landscape";
    screen.orientation.lock(type).catch(err => console.log("Orientation change failed:", err));
  } else {
    alert("Orientation API not supported");
  }
});

// Ticker updater
function updateTicker(title) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  tickerEl.textContent = `Testing new TV service - Now Playing: ${title} - ${timeStr}  |  Testing new TV service - Now Playing: ${title} - ${timeStr}`;
}

// --- Ad Cycling ---
const ads = [
  "🔥 Buy Now! Limited Offer 🔥",
  "🎉 50% Off Today Only 🎉",
  "🧵 New Sewing Machine Available 🧵",
  "📺 Upgrade Your TV Experience 📺",
  "💡 Smart Deals Just For You 💡"
];
let adIndex = 0;

function cycleAds() {
  adBar.textContent = ads[adIndex];
  adIndex = (adIndex + 1) % ads.length;
}
setInterval(cycleAds, 5000);
cycleAds();

// --- Show/Hide Controls on Video Click ---
let hideTimeout;
playerEl.addEventListener('click', () => {
  controls.classList.add("show");
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => controls.classList.remove("show"), 3000);
});

// Init
fetchPlaylist().then(data => {
  playlist = data;
  loadVideo(currentIndex);
});