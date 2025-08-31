// Load JSON Playlist
async function fetchPlaylist() {
  const response = await fetch('playlist.json');
  return await response.json();
}

// Load Ads JSON
async function fetchAds() {
  const response = await fetch('ads.json');
  return await response.json();
}

let playlist = [];
let currentIndex = 0;
let ads = [];
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

// Orientation Change
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

// --- Ad Scheduler ---
let lastAdTime = 0;

function showAd(ad) {
  adBar.innerHTML = `<img src="${ad.image}" alt="Ad">`;
  adBar.classList.add("show");

  setTimeout(() => {
    adBar.classList.remove("show");
  }, 10000); // hide after 10 sec
}

function scheduleAds() {
  setInterval(() => {
    const now = Date.now();
    if (now - lastAdTime >= 60000) { // once a minute
      const ad = ads[Math.floor(Math.random() * ads.length)];
      showAd(ad);
      lastAdTime = now;
    }
  }, 5000); // check every 5s
}

// --- Show/Hide Controls on Video Click ---
let hideTimeout;
playerEl.addEventListener('click', () => {
  controls.classList.add("show");
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => controls.classList.remove("show"), 3000);
});

// Init
Promise.all([fetchPlaylist(), fetchAds()]).then(([pl, adList]) => {
  playlist = pl;
  ads = adList;
  loadVideo(currentIndex);
  scheduleAds();
});