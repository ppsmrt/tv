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

  // Update ticker with video title and time
  updateTicker(item.title);
}

function nextVideo() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadVideo(currentIndex);
}

// Controls
document.getElementById('playPause').addEventListener('click', () => {
  if (player.playing) player.pause();
  else player.play();
});

document.getElementById('volume').addEventListener('input', e => player.volume = e.target.value);

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  player.fullscreen.enter();
});

// Ticker updater
function updateTicker(title) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  tickerEl.textContent = `Testing new TV service - Now Playing: ${title} - ${timeStr}  |  Testing new TV service - Now Playing: ${title} - ${timeStr}`;
}

// Init
fetchPlaylist().then(data => {
  playlist = data;
  loadVideo(currentIndex);
});
