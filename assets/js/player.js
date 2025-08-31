// Load JSON Playlist
async function fetchPlaylist() {
  const response = await fetch('playlist.json');
  if (!response.ok) throw new Error("Failed to load playlist.json");
  return await response.json();
}

// Load Ads JSON (Fixed Path)
async function fetchAds() {
  const response = await fetch('data/ads.json');
  if (!response.ok) throw new Error("Failed to load ads.json");
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
const centerPlayBtn = document.getElementById('centerPlayBtn');

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
    updateUIOnPlay();
  });

  player.off('ended', nextVideo);
  player.on('ended', nextVideo);

  updateTicker(item.title);
}

// Play next video
function nextVideo() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadVideo(currentIndex);
}

// Update Play/Pause UI
function updateUIOnPlay() {
  playPauseBtn.className = player.playing ? "fas fa-pause" : "fas fa-play";
  centerPlayBtn.style.opacity = player.playing ? "0" : "1";
}

// Play/Pause Toggle (Custom Bar)
document.getElementById('playPause').addEventListener('click', () => {
  if (player.playing) {
    player.pause();
  } else {
    player.play();
  }
  updateUIOnPlay();
});

// Center Play Button
centerPlayBtn.addEventListener('click', () => {
  if (player.playing) {
    player.pause();
  } else {
    player.play();
  }
  updateUIOnPlay();
});

// Fullscreen
document.getElementById('fullscreenBtn').addEventListener('click', () => {
  player.fullscreen.enter();
});

// Orientation Toggle
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
  tickerEl.textContent = `Now Playing: ${title} - ${timeStr} | Enjoy your stream!`;
}

// --- Ad Scheduler ---
let lastAdTime = 0;

function showAd(ad) {
  adBar.innerHTML = `<img src="${ad.image}" alt="Ad">`;
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

// --- Show/Hide Controls on Video Click ---
let hideTimeout;
playerEl.addEventListener('click', () => {
  controls.classList.add("show");
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => controls.classList.remove("show"), 3000);
});

// Init
Promise.all([fetchPlaylist(), fetchAds()])
  .then(([pl, adList]) => {
    playlist = pl;
    ads = adList;
    loadVideo(currentIndex);
    scheduleAds();
  })
  .catch(err => console.error("Error initializing player:", err));

const video = document.getElementById('videoPlayer');
const controls = document.getElementById('controls');
const playPauseBtn = document.getElementById('playPause');
const volumeBtn = document.getElementById('volumeToggle');
const fullscreenBtn = document.getElementById('fullscreenToggle');
const rotateBtn = document.getElementById('rotateToggle');
const centerPlay = document.getElementById('centerPlay');
const loader = document.querySelector('.loader');
const adBar = document.getElementById('adBar');

// Show loader until video can play
video.addEventListener('canplay', () => loader.style.display = 'none');

// Show controls on mouse move
let hideTimeout;
document.querySelector('.player-wrapper').addEventListener('mousemove', () => {
  controls.classList.add('show');
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => controls.classList.remove('show'), 3000);
});

// Play / Pause
playPauseBtn.addEventListener('click', togglePlay);
centerPlay.addEventListener('click', togglePlay);

function togglePlay() {
  if (video.paused) {
    video.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    centerPlay.classList.remove('show');
  } else {
    video.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    centerPlay.classList.add('show');
  }
}

// Volume Toggle
volumeBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  volumeBtn.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
});

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Orientation Toggle
rotateBtn.addEventListener('click', async () => {
  if (screen.orientation && screen.orientation.lock) {
    try {
      if (screen.orientation.type.startsWith('portrait')) {
        await screen.orientation.lock('landscape');
      } else {
        await screen.orientation.lock('portrait');
      }
    } catch (error) {
      alert('Orientation lock not supported in this browser.');
    }
  } else {
    // Fallback: rotate the player with CSS
    const wrapper = document.querySelector('.player-wrapper');
    if (!wrapper.classList.contains('rotated')) {
      wrapper.style.transform = 'rotate(90deg) scale(0.8)';
      wrapper.classList.add('rotated');
    } else {
      wrapper.style.transform = 'rotate(0deg) scale(1)';
      wrapper.classList.remove('rotated');
    }
  }
});

// Show center play on pause
video.addEventListener('pause', () => centerPlay.classList.add('show'));
video.addEventListener('play', () => centerPlay.classList.remove('show'));

// Show ad after 10s for 5s
setTimeout(() => {
  adBar.classList.add('show');
  setTimeout(() => adBar.classList.remove('show'), 5000);
}, 10000);

