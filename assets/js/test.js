// Player.js (Shaka + Hls.js fallback)
// Keep as ES module if your server serves modules; otherwise remove type=module usage in HTML.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ------------------ DOM ------------------ */
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

const playerLoader = document.getElementById('playerLoader');
const playerLoaderText = document.getElementById('playerLoaderText');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let channelsList = [];
let currentIndex = -1;
let controlsTimeout, scale = 1, initialDistance = null;

/* ------------------ Firebase ------------------ */
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

/* ------------------ Query string helper ------------------ */
function qs(name) {
  return new URL(location.href).searchParams.get(name);
}
let streamSlug = qs('stream');
if (streamSlug) streamSlug = streamSlug.replace(/-/g, ' ').toLowerCase();

/* ------------------ Playback engines ------------------ */
let shakaPlayer = null;
let hlsInstance = null;
let usingEngine = null;
let retryAttempts = 0;
const MAX_RETRIES = 4;

/* Loader */
function showLoader(text = 'Loading...') {
  playerLoaderText.textContent = text;
  playerLoader.classList.add('show');
}
function hideLoader() {
  playerLoader.classList.remove('show');
}

/* Logging */
function log(...args) { console.debug('[PLAYER]', ...args); }
function warn(...args) { console.warn('[PLAYER]', ...args); }
function err(...args) { console.error('[PLAYER]', ...args); }

/* Shaka init/destroy/load */
function initShaka() {
  if (!window.shaka) return false;
  try {
    shaka.polyfill.installAll();
    shakaPlayer = new shaka.Player(video);
    const retryParams = { maxAttempts: 4, baseDelay: 1000, backoffFactor: 2 };
    shakaPlayer.configure({
      manifest: { retryParameters: retryParams },
      streaming: { retryParameters: retryParams, rebufferingGoal: 8 },
      drm: {}
    });
    shakaPlayer.addEventListener('error', e => warn('Shaka error', e.detail || e));
    return true;
  } catch (e) { return false; }
}
function destroyShaka() { if (shakaPlayer) { try { shakaPlayer.destroy(); } catch {} shakaPlayer = null; } }
async function tryShakaLoad(url) {
  if (!shakaPlayer) initShaka();
  if (!shakaPlayer) throw new Error('Shaka not initialized');
  usingEngine = 'shaka'; showLoader('Starting (Shaka)...');
  try {
    await shakaPlayer.load(url);
    hideLoader(); retryAttempts = 0; return true;
  } catch (e) { destroyShaka(); hideLoader(); throw e; }
}

/* Hls.js init/destroy/load */
function destroyHls() { if (hlsInstance) { try { hlsInstance.destroy(); } catch {} hlsInstance = null; } }
function tryHlsJsLoad(url) {
  return new Promise((resolve, reject) => {
    if (!window.Hls) return reject(new Error('hls.js not available'));
    usingEngine = 'hls.js'; showLoader('Starting (hls.js)...');
    destroyHls(); const HlsConstructor = window.Hls;
    hlsInstance = new HlsConstructor({ maxBufferLength: 30, enableWorker: true });
    hlsInstance.on(HlsConstructor.Events.ERROR, (event, data) => {
      if (data.fatal) {
        if (data.type === HlsConstructor.ErrorTypes.NETWORK_ERROR) hlsInstance.startLoad();
        else if (data.type === HlsConstructor.ErrorTypes.MEDIA_ERROR) hlsInstance.recoverMediaError();
        else { destroyHls(); hideLoader(); reject(new Error('hls fatal')); }
      }
    });
    hlsInstance.attachMedia(video);
    hlsInstance.on(HlsConstructor.Events.MEDIA_ATTACHED, () => hlsInstance.loadSource(url));
    hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, () => { hideLoader(); retryAttempts = 0; resolve(true); });
    setTimeout(() => { destroyHls(); hideLoader(); reject(new Error('hls manifest timeout')); }, 12000);
  });
}

/* Native fallback */
async function tryNativeLoad(url) {
  usingEngine = 'native'; showLoader('Starting (native)...');
  return new Promise((resolve, reject) => {
    video.src = url; video.load();
    const onPlay = () => { hideLoader(); retryAttempts = 0; video.removeEventListener('playing', onPlay); resolve(true); };
    const onError = () => { hideLoader(); video.removeEventListener('error', onError); reject(new Error('native failed')); };
    video.addEventListener('playing', onPlay); video.addEventListener('error', onError);
    setTimeout(() => { video.removeEventListener('playing', onPlay); video.removeEventListener('error', onError); hideLoader(); reject(new Error('native timeout')); }, 12000);
    video.play().catch(() => {});
  });
}

/* Stream loader with fallback chain */
async function loadStreamWithFallback(url) {
  destroyShaka(); destroyHls(); video.pause(); video.removeAttribute('src'); video.load();
  async function attemptChain() {
    try { return await tryShakaLoad(url); } catch {}
    try { return await tryHlsJsLoad(url); } catch {}
    try { return await tryNativeLoad(url); } catch {}
    return false;
  }
  let attempt = 0, success = false;
  while (attempt <= MAX_RETRIES && !success) {
    attempt++; retryAttempts = attempt;
    const backoffMs = Math.min(3000 * Math.pow(2, attempt - 1), 20000);
    success = await attemptChain();
    if (!success) await new Promise(r => setTimeout(r, backoffMs));
  }
  if (!success) hideLoader();
  return success;
}

/* ------------------ Channel/playlist ------------------ */
const channelsRef = ref(db, 'channels');
get(channelsRef).then(snapshot => {
  if (snapshot.exists()) {
    channelsList = []; snapshot.forEach(c => channelsList.push(c.val()));
    channelsList = channelsList.map(c => ({ ...c, slug: c.name.toLowerCase() }));
    currentIndex = channelsList.findIndex(c => c.slug === streamSlug);
    if (currentIndex !== -1) loadChannel(currentIndex);
  }
});
async function loadChannel(index) {
  if (index < 0 || index >= channelsList.length) return;
  const channel = channelsList[index];
  videoTitle.textContent = channel.name || 'Live Stream';
  localStorage.setItem("selectedVideo", channel.stream);
  localStorage.setItem("selectedVideoTitle", channel.name || "Live Stream");
  currentIndex = index; updateFavButtons();
  try { await loadStreamWithFallback(channel.stream); video.play().catch(() => {}); } catch {}
}

/* ------------------ WebView detection ------------------ */
function isInWebView() {
  const ua = navigator.userAgent || "";
  return /\b(wv|WebView|Crosswalk|; wv)\b/i.test(ua) || !!window.Android;
}

/* ------------------ UI Controls ------------------ */
// Play/Pause
playBtn.addEventListener('click', () => {
  if (video.paused) { video.play(); playBtn.textContent = 'pause'; }
  else { video.pause(); playBtn.textContent = 'play_arrow'; }
});

// Fullscreen with WebView fallback
fsBtn.addEventListener('click', () => {
  if (isInWebView()) {
    const container = video.parentElement;
    container.classList.toggle("fixed");
    container.classList.toggle("inset-0");
    container.classList.toggle("z-[9999]");
    container.classList.toggle("bg-black");
    video.classList.toggle("w-full");
    video.classList.toggle("h-full");
    video.classList.toggle("object-contain");
  } else {
    if (!document.fullscreenElement) {
      video.parentElement.requestFullscreen?.({ navigationUI: 'hide' });
      screen.orientation?.lock('landscape').catch(() => {});
    } else { document.exitFullscreen(); screen.orientation?.unlock?.(); }
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

// Auto-hide controls
function showControls() {
  controls.classList.remove('hidden'); clearTimeout(controlsTimeout);
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
  if (!favorites.some(f => f.src === videoSrc)) {
    favorites.push({ title, src: videoSrc });
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  updateFavButtons();
});
removeFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  favorites = favorites.filter(f => f.src !== videoSrc);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

/* ===== PREMIUM FEATURES ===== */
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

// PiP (disabled in WebView)
pipBtn.addEventListener("click", async () => {
  if (isInWebView()) return;
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

/* ------------------ Pinch/Zoom ------------------ */
video.addEventListener('wheel', e => {
  scale += e.deltaY * -0.001; scale = Math.min(Math.max(1, scale), 3);
  video.style.transform = `scale(${scale})`;
});
video.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
  }
});
video.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && initialDistance) {
    const currentDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    scale = Math.min(Math.max(1, scale * (currentDistance / initialDistance)), 3);
    video.style.transform = `scale(${scale})`;
    initialDistance = currentDistance;
  }
});
video.addEventListener('touchend', e => { if (e.touches.length < 2) initialDistance = null; });

/* maintain fullscreen styles */
function applyFullscreenStyles() {
  if (document.fullscreenElement) {
    video.style.width = '100%'; video.style.height = '100%'; video.style.objectFit = 'cover'; video.style.transform = `scale(${scale})`;
  } else { video.style.width = ''; video.style.height = ''; video.style.objectFit = ''; video.style.transform = ''; }
}
document.addEventListener('fullscreenchange', applyFullscreenStyles);
window.addEventListener('resize', applyFullscreenStyles);
window.addEventListener('orientationchange', applyFullscreenStyles);

/* End of file */