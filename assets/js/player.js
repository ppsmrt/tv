// --- Load Playlist ---
async function fetchPlaylist() {
  const response = await fetch('playlist.json');
  if (!response.ok) throw new Error("Failed to load playlist.json");
  return await response.json();
}

// --- Load Ads ---
async function fetchAds() {
  const response = await fetch('data/ads.json');
  if (!response.ok) throw new Error("Failed to load ads.json");
  return await response.json();
}

// --- Variables ---
let playlist = [];
let currentIndex = 0;
let ads = [];
let lastAdTime = 0;
let hideTimeout;

const loader = document.getElementById('loader');
const playerEl = document.getElementById('player');
const player = new Plyr(playerEl, { controls: [] });
const tickerEl = document.getElementById('ticker');
const adBar = document.getElementById('adBar');
const controls = document.getElementById('customControls');
const playPauseBtn = document.getElementById('playPause').querySelector("i");
const centerPlayBtn = document.getElementById('centerPlayBtn');

// --- Load Video from Playlist ---
function loadVideo(index) {
  const item = playlist[index];
  loader.style.display = 'block';
