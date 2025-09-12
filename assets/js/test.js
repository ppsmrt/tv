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
/*
  Strategy:
  1. Try Shaka Player (recommended)
  2. If Shaka fails, try Hls.js (if supported)
  3. If Hls.js fails, try native <video> src (may work on some Safari)
  The code will attempt retries on network/manifest errors with backoff.
*/
let shakaPlayer = null;
let hlsInstance = null;
let usingEngine = null; // "shaka" | "hls.js" | "native"
let retryAttempts = 0;
const MAX_RETRIES = 4;

/* show/hide loader */
function showLoader(text = 'Loading...') {
  playerLoaderText.textContent = text;
  playerLoader.classList.add('show');
}
function hideLoader() {
  playerLoader.classList.remove('show');
}

/* Logging helper (silent to users, console only) */
function log(...args) { console.debug('[PLAYER]', ...args); }
function warn(...args) { console.warn('[PLAYER]', ...args); }
function err(...args) { console.error('[PLAYER]', ...args); }

/* Initialize Shaka (if available) */
function initShaka() {
  if (!window.shaka) {
    warn('Shaka not available');
    return false;
  }
  try {
    shaka.polyfill.installAll();
    shakaPlayer = new shaka.Player(video);

    // Configure retryParameters for manifest/segment fetch
    const retryParams = {
      maxAttempts: 4,
      baseDelay: 1000,
      backoffFactor: 2
    };
    shakaPlayer.configure({
      manifest: { retryParameters: retryParams },
      streaming: { retryParameters: retryParams, rebufferingGoal: 8 },
      drm: {}
    });

    shakaPlayer.addEventListener('error', (e) => {
      const detail = e.detail || e;
      warn('Shaka error code=', detail?.code || detail);
      // Let loadStream handle fallback logic
    });

    return true;
  } catch (e) {
    warn('Shaka init failed:', e);
    return false;
  }
}

/* Destroy Shaka instance cleanly */
function destroyShaka() {
  if (shakaPlayer) {
    try { shakaPlayer.destroy(); } catch (e) {}
    shakaPlayer = null;
  }
}

/* Destroy Hls instance */
function destroyHls() {
  if (hlsInstance) {
    try { hlsInstance.destroy(); } catch (e) {}
    hlsInstance = null;
  }
}

/* Try to load via Shaka */
async function tryShakaLoad(url) {
  if (!shakaPlayer) initShaka();
  if (!shakaPlayer) throw new Error('Shaka not initialized');

  usingEngine = 'shaka';
  showLoader('Starting (Shaka)...');
  try {
    // shaka expects a manifest URL (DASH/HLS). HLS (m3u8) is supported.
    await shakaPlayer.load(url);
    log('Shaka loaded manifest successfully');
    hideLoader();
    retryAttempts = 0;
    return true;
  } catch (e) {
    warn('Shaka load failed:', e);
    destroyShaka();
    hideLoader();
    throw e;
  }
}

/* Try to load via Hls.js */
function tryHlsJsLoad(url) {
  return new Promise((resolve, reject) => {
    if (!window.Hls) {
      warn('Hls.js not available');
      return reject(new Error('hls.js not available'));
    }
    usingEngine = 'hls.js';
    showLoader('Starting (hls.js)...');

    destroyHls();
    const HlsConstructor = window.Hls;
    // Use default config with some retry/backoff
    hlsInstance = new HlsConstructor({
      maxBufferLength: 30,
      xhrSetup: (xhr, url) => { /* optional headers */ },
      enableWorker: true
    });

    hlsInstance.on(HlsConstructor.Events.ERROR, function (event, data) {
      warn('hls.js error', data);
      if (data.fatal) {
        // Try to recover certain errors
        if (data.type === HlsConstructor.ErrorTypes.NETWORK_ERROR) {
          warn('hls.js network fatal, try recover');
          hlsInstance.startLoad(); // attempt restart
        } else if (data.type === HlsConstructor.ErrorTypes.MEDIA_ERROR) {
          warn('hls.js media fatal, try recover');
          hlsInstance.recoverMediaError();
        } else {
          destroyHls();
          hideLoader();
          reject(new Error('hls fatal: ' + JSON.stringify(data)));
        }
      }
    });

    hlsInstance.attachMedia(video);
    hlsInstance.on(HlsConstructor.Events.MEDIA_ATTACHED, function() {
      hlsInstance.loadSource(url);
    });

    hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, function() {
      log('hls.js manifest parsed');
      hideLoader();
      retryAttempts = 0;
      resolve(true);
    });

    // timeouts: if nothing happens after 10s, fail
    const manifestTimeout = setTimeout(() => {
      warn('hls.js manifest timeout');
      destroyHls();
      hideLoader();
      reject(new Error('hls manifest timeout'));
    }, 12000);

    // clear timeout on success/resolution
    hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, () => clearTimeout(manifestTimeout));
  });
}

/* Native playback fallback */
async function tryNativeLoad(url) {
  usingEngine = 'native';
  showLoader('Starting (native)...');
  return new Promise((resolve, reject) => {
    video.src = url;
    video.load();

    const onPlay = () => {
      hideLoader();
      retryAttempts = 0;
      video.removeEventListener('playing', onPlay);
      resolve(true);
    };
    const onError = () => {
      hideLoader();
      video.removeEventListener('error', onError);
      reject(new Error('native playback failed'));
    };

    video.addEventListener('playing', onPlay);
    video.addEventListener('error', onError);

    // If it doesn't start in X seconds, treat as failure
    setTimeout(() => {
      video.removeEventListener('playing', onPlay);
      video.removeEventListener('error', onError);
      warn('native playback timeout');
      hideLoader();
      reject(new Error('native timeout'));
    }, 12000);

    // attempt to play after setting src (auto-play may be blocked by browser)
    video.play().catch(() => { /* ignore autoplay rejection */ });
  });
}

/* Attempt load with fallback chain and retry/backoff */
async function loadStreamWithFallback(url) {
  // reset previous engines
  destroyShaka(); destroyHls();
  video.pause();
  video.removeAttribute('src');
  video.load();

  // small function to attempt one chain
  async function attemptChain() {
    // 1) Try Shaka
    try {
      await tryShakaLoad(url);
      log('Playing with Shaka');
      return true;
    } catch (eShaka) {
      warn('Shaka failed, falling back to hls.js/native', eShaka);
    }

    // 2) Try Hls.js
    try {
      await tryHlsJsLoad(url);
      log('Playing with hls.js');
      return true;
    } catch (eHls) {
      warn('hls.js failed', eHls);
    }

    // 3) Try native
    try {
      await tryNativeLoad(url);
      log('Playing with native <video>');
      return true;
    } catch (eNative) {
      warn('native playback failed', eNative);
    }

    // all attempts failed
    return false;
  }

  // retries with exponential backoff
  let attempt = 0;
  let success = false;
  while (attempt <= MAX_RETRIES && !success) {
    attempt++;
    retryAttempts = attempt;
    const backoffMs = Math.min(3000 * Math.pow(2, attempt - 1), 20000);
    try {
      log(`Attempt ${attempt} to load stream`);
      success = await attemptChain();
      if (success) break;
      // else wait/backoff then retry
      log(`Attempt ${attempt} failed, backing off ${backoffMs}ms before retry`);
      await new Promise(r => setTimeout(r, backoffMs));
    } catch (e) {
      warn('Error during attemptChain:', e);
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }

  if (!success) {
    // Final fallback: leave video blank, hide loader — we avoid alerts to users.
    warn('All playback attempts failed for', url);
    hideLoader();
    // Optionally: show a small unobtrusive overlay (not an alert).
    return false;
  }
  return true;
}

/* ------------------ Channel/playlist integration ------------------ */
const channelsRef = ref(db, 'channels');
get(channelsRef).then(snapshot => {
  if (snapshot.exists()) {
    channelsList = [];
    snapshot.forEach(childSnap => channelsList.push(childSnap.val()));
    channelsList = channelsList.map(c => ({ ...c, slug: c.name.toLowerCase() }));
    currentIndex = channelsList.findIndex(c => c.slug === streamSlug);
    if (currentIndex !== -1) loadChannel(currentIndex);
    else {
      // If no slug provided or not found, load first channel if available
      if (channelsList.length > 0) {
        if (currentIndex === -1) {
          // if user didn't request stream, pick first
          // loadChannel(0);
          // We will not auto load unless explicitly requested — keep existing behavior
        }
      }
    }
  } else {
    warn('No channels in DB');
  }
}).catch(e => {
  warn('Firebase read failed:', e);
});

/* Use this to load a channel by index (invokes robust stream loader) */
async function loadChannel(index) {
  if (index < 0 || index >= channelsList.length) return;
  const channel = channelsList[index];
  if (!channel || !channel.stream) {
    warn('Channel missing stream URL');
    return;
  }
  videoTitle.textContent = channel.name || 'Live Stream';
  localStorage.setItem("selectedVideo", channel.stream);
  localStorage.setItem("selectedVideoTitle", channel.name || "Live Stream");
  currentIndex = index;
  updateFavButtons();

  // start playback chain
  const url = channel.stream;
  // If manifest is relative or non-standard, you may need to normalize here.

  // Best-effort: try load stream with Shaka + fallbacks
  try {
    await loadStreamWithFallback(url);
    // ensure autoplay attempt
    video.play().catch(() => {});
  } catch (e) {
    warn('loadChannel final error:', e);
  }
}

/* ------------------ Existing UI logic (unchanged) ------------------ */
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
  // avoid duplicates
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

// PiP
pipBtn.addEventListener("click", async () => {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else {
    try { await video.requestPictureInPicture(); } catch (e) { warn('PiP failed', e); }
  }
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

/* ------------------ Extra: pinch/zoom retained ------------------ */
// Pinch and wheel zoom
video.addEventListener('wheel', e => {
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(1, scale), 3);
  video.style.transform = `scale(${scale})`;
});
video.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
  }
});
video.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && initialDistance) {
    const currentDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    scale = Math.min(Math.max(1, scale * (currentDistance / initialDistance)), 3);
    video.style.transform = `scale(${scale})`;
    initialDistance = currentDistance;
  }
});
video.addEventListener('touchend', e => {
  if (e.touches.length < 2) initialDistance = null;
});

/* maintain fullscreen styles */
function applyFullscreenStyles() {
  if (document.fullscreenElement) {
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.transform = `scale(${scale})`;
  } else {
    video.style.width = '';
    video.style.height = '';
    video.style.objectFit = '';
    video.style.transform = '';
  }
}
document.addEventListener('fullscreenchange', applyFullscreenStyles);
window.addEventListener('resize', applyFullscreenStyles);
window.addEventListener('orientationchange', applyFullscreenStyles);

/* End of file */