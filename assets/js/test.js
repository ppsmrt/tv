// Make sure Shaka script is included in HTML as shown above
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* --------- DOM elements (assumes these exist in your HTML) ---------- */
const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');
const addFavBtn = document.getElementById('addFav');
const removeFavBtn = document.getElementById('removeFav');
const container = document.getElementById('videoContainer'); // container for fullscreen sizing

/* ----------------- state vars ------------------ */
let controlsTimeout;
let scale = 1;
let initialDistance = null;
let shakaPlayer = null;
let shakaLoadedManifest = null; // track manifest loaded by shaka

/* ---------------- Firebase config ---------------- */
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

/* ---------------- Helper: get query string ---------------- */
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

/* ---------------- Ensure we hide native controls (we use custom ones) ---------------- */
video.controls = false; // hide native browser controls

/* ------------- Shaka initialization & loader ------------- */
function initShaka() {
  // install polyfills and check support
  if (!window.shaka) {
    console.warn('Shaka Player not found. Add the Shaka script tag to your HTML.');
    return;
  }

  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error('Shaka: Browser not supported for advanced playback. Falling back to native playback.');
    return;
  }

  // Destroy prior player if any
  if (shakaPlayer) {
    try { shakaPlayer.destroy(); } catch (e) { /* ignore */ }
    shakaPlayer = null;
  }

  shakaPlayer = new shaka.Player(video);

  // Keep player config minimal and hidden (no UI exposed) — tweak for a premium behavior:
  shakaPlayer.configure({
    streaming: {
      // lower rebuffer aggressiveness for smoother premium experience
      rebufferingGoal: 4,
      bufferingGoal: 30
    },
    abr: {
      enabled: true,     // adaptive bitrate ON
      defaultBandwidthEstimate: 1000000
    },
    manifest: {
      // keep manifest warnings silent (no UI)
      retryParameters: { maxAttempts: 2 }
    }
  });

  // Log shaka errors to console for debugging
  shakaPlayer.addEventListener('error', onShakaError);

  // Prevent Shaka from adding any UI — we don't use shaka.ui
}

function onShakaError(event) {
  const shakaErr = event.detail || event;
  console.error('Shaka error', shakaErr);
  // Optionally show a clean alert for users:
  // alert('Playback error. Please try again later.');
}

/* Load the given stream URL using Shaka if supported, else fallback to setting video.src for MP4 */
async function loadWithShakaOrFallback(url) {
  if (!url) return;
  shakaLoadedManifest = null;

  if (window.shaka && shaka.Player.isBrowserSupported()) {
    try {
      // Try Shaka load (works for DASH/HLS/progressive as Shaka supports HLS manifests in many browsers)
      await shakaPlayer.load(url); // throws on failure
      shakaLoadedManifest = url;
      // Ensure play is attempted
      try { await video.play(); } catch (e) { /* autoplay policies may prevent immediate play */ }
      console.log('Shaka loaded manifest:', url);
      return;
    } catch (err) {
      console.warn('Shaka failed to load manifest, falling back to native src. Error:', err);
      // destroy shaka player to avoid conflicts with native playback
      try { shakaPlayer.destroy(); } catch (e) {}
      shakaPlayer = null;
    }
  }

  // Fallback: use native video src (for progressive mp4 etc.)
  video.src = url;
  video.load();
  try { await video.play(); } catch (e) {}
}

/* ----------------- Firebase: fetch channel and start playback ----------------- */
let streamSlug = qs('stream');
if (streamSlug) streamSlug = streamSlug.replace(/-/g, ' ').toLowerCase();

if (!streamSlug) {
  alert('No stream specified');
} else {
  const channelsRef = ref(db, 'channels');
  get(channelsRef).then(snapshot => {
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(childSnap => {
        const data = childSnap.val();
        if (data.name && data.name.toLowerCase() === streamSlug) {
          found = true;
          const streamUrl = data.stream;
          const title = data.name || 'Live Stream';
          videoTitle.textContent = title;
          localStorage.setItem('selectedVideo', streamUrl);
          localStorage.setItem('selectedVideoTitle', title);

          // Initialize Shaka (if not already)
          initShaka();

          // Use Shaka player loader (async)
          loadWithShakaOrFallback(streamUrl);

          // keep video element ready for transforms and custom controls (no native UI)
        }
      });
      if (!found) alert('Channel not found: ' + streamSlug);
    } else {
      alert('No channels available in database');
    }
  }).catch(err => {
    console.error('Firebase read failed:', err);
    alert('Failed to load stream data');
  });
}

/* ------------------ Controls: Play/Pause ------------------- */
playBtn.addEventListener('click', async () => {
  if (video.paused) {
    try {
      await video.play();
      playBtn.textContent = 'pause';
    } catch (e) {
      console.warn('Play blocked by autoplay policies:', e);
      playBtn.textContent = 'play_arrow';
    }
  } else {
    video.pause();
    playBtn.textContent = 'play_arrow';
  }
});

/* ------------------ Fullscreen (works with container & webkit fallback) ------------------ */
fsBtn.addEventListener('click', () => {
  if (document.fullscreenElement || video.webkitDisplayingFullscreen) {
    if (document.exitFullscreen) document.exitFullscreen();
    if (video.webkitExitFullscreen) video.webkitExitFullscreen();
    container.style.width = '100%';
    container.style.height = '100%';
    video.style.width = '100%';
    video.style.height = '100%';
  } else {
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {});
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
    container.style.width = '100vw';
    container.style.height = '100vh';
    video.style.width = '100%';
    video.style.height = '100%';
  }
});

/* ------------------ Mute & Volume ------------------ */
muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});
volumeSlider.addEventListener('input', () => {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});

/* ------------------ show/hide custom controls ------------------ */
const showControls = () => {
  controls.classList.remove('hidden');
  clearTimeout(controlsTimeout);
  if (window.matchMedia("(orientation: landscape)").matches) {
    controlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
  }
};
video.addEventListener('mousemove', showControls);
video.addEventListener('touchstart', showControls);

function updateControlsVisibility() {
  if (window.matchMedia("(orientation: landscape)").matches) {
    controls.classList.add('hidden');
  } else {
    controls.classList.remove('hidden');
  }
}
window.addEventListener('orientationchange', updateControlsVisibility);
document.addEventListener('DOMContentLoaded', updateControlsVisibility);

video.addEventListener('click', () => {
  if (window.matchMedia("(orientation: landscape)").matches) {
    if (controls.classList.contains('hidden')) {
      controls.classList.remove('hidden');
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
    } else {
      controls.classList.add('hidden');
    }
  }
});

/* ------------------ Pinch & Wheel Zoom (keeps existing behavior) ------------------ */
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

/* ------------------ Keep fullscreen styles correct ------------------ */
function applyFullscreenStyles() {
  if (document.fullscreenElement || video.webkitDisplayingFullscreen) {
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

/* ------------------ Favorites (unchanged logic) ------------------ */
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function updateFavButtons() {
  const videoSrc = localStorage.getItem('selectedVideo');
  const isFav = favorites.some(fav => fav.src === videoSrc);
  if (isFav) {
    addFavBtn.classList.add('hidden');
    removeFavBtn.classList.remove('hidden');
  } else {
    addFavBtn.classList.remove('hidden');
    removeFavBtn.classList.add('hidden');
  }
}
updateFavButtons();

addFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  const videoTitleStored = localStorage.getItem('selectedVideoTitle') || 'Unknown';
  if (!videoSrc) return;
  favorites.push({
    title: videoTitleStored,
    src: videoSrc,
    thumb: '',
    category: 'Unknown'
  });
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

removeFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  favorites = favorites.filter(fav => fav.src !== videoSrc);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

/* ------------------ Optional: Expose a safe function to reload same stream (useful in mobile webviews) ------------------ */
window.reloadCurrentStream = async function() {
  const current = localStorage.getItem('selectedVideo');
  if (!current) return;
  // if shaka was using this manifest, reload via shaka
  if (shakaPlayer) {
    try {
      await shakaPlayer.load(current);
      return;
    } catch (e) {
      console.warn('Reload with Shaka failed, trying fallback', e);
    }
  }
  video.src = current;
  video.load();
  try { await video.play(); } catch (e) {}
}