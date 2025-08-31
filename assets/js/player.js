// Fetch data
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.json();
}

let playlist = [];
let currentIndex = 0;
let ads = [];
let tickerData = [];

const loader = document.getElementById('loader');
const playerEl = document.getElementById('player');
const tickerEl = document.getElementById('ticker');
const adBar = document.getElementById('adBar');
const controls = document.getElementById('customControls');
const playPauseBtn = document.querySelector("#playPause i");

const player = new Plyr(playerEl, { controls: [] });

// Load video
function loadVideo(index) {
  const item = playlist[index];
  loader.style.display = 'block';

  player.source = {
    type: 'video',
    sources: [{ src: item.url, type: 'video/mp4' }]
  };

  player.once('ready', () => {
    loader.style.display = 'none';
    player.muted = true;
    player.play().catch(err => console.log("Autoplay failed:", err));
  });

  player.off('ended', nextVideo);
  player.on('ended', nextVideo);

  updateTicker(item.title);
}

// Next video
function nextVideo() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadVideo(currentIndex);
}

// Play/Pause
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

// Orientation
document.getElementById('orientationBtn').addEventListener('click', () => {
  if (screen.orientation) {
    let type = screen.orientation.type.startsWith("landscape") ? "portrait" : "landscape";
    screen.orientation.lock(type).catch(err => console.log("Orientation change failed:", err));
  } else {
    alert("Orientation API not supported");
  }
});

// Ticker
function updateTicker(title) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  const extraTicker = tickerData.length ? ` | ${tickerData.join(" | ")}` : "";
  tickerEl.textContent = `Now Playing: ${title} - ${timeStr}${extraTicker}`;
}

// Ads
let lastAdTime = 0;
function showAd(ad) {
  adBar.textContent = ad.text;
  adBar.classList.add("show");
  setTimeout(() => adBar.classList.remove("show"), 10000);
}

function scheduleAds() {
  setInterval(() => {
    const now = Date.now();
    if (now - lastAdTime >= 60000) {
      const ad = ads[Math.floor(Math.random() * ads.length)];
      showAd(ad);
      lastAdTime = now;
    }
  }, 5000);
}

// Show/Hide Controls
let hideTimeout;
playerEl.addEventListener('click', () => {
  controls.classList.add("show");
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => controls.classList.remove("show"), 3000);
});

// Init
Promise.all([
  fetchJSON('playlist.json'),
  fetchJSON('data/ads.json'),
  fetchJSON('data/ticker.json')
])
  .then(([pl, adList, tickerList]) => {
    playlist = pl;
    ads = adList;
    tickerData = tickerList;
    loadVideo(currentIndex);
    scheduleAds();
  })
  .catch(err => console.error("Error initializing player:", err));