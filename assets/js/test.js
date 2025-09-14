import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Elements
const video = document.getElementById('videoPlayer');
const playPauseBtn = document.getElementById('playPause');
const seekBar = document.getElementById('seekBar');
const volumeBar = document.getElementById('volumeBar');
const currentTimeText = document.getElementById('currentTime');
const totalTimeText = document.getElementById('totalTime');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const goBack = document.getElementById('goBack');
const controlsOverlay = document.getElementById('controlsOverlay');
const channelNameEl = document.getElementById('channelName');

let controlsTimeout;
let scale = 1;
let initialDistance = null;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb"
};

initializeApp(firebaseConfig);
const db = getDatabase();

// Helpers
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

// Load stream from Firebase
let streamSlug = qs('stream');
if (streamSlug) streamSlug = streamSlug.replace(/-/g, ' ').toLowerCase();

if (streamSlug) {
  get(ref(db, 'channels')).then(snapshot => {
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(child => {
        const data = child.val();
        if (data.name?.toLowerCase() === streamSlug) {
          found = true;
          video.src = data.stream;
          channelNameEl.textContent = data.name;
          localStorage.setItem('selectedVideo', data.stream);
          localStorage.setItem('selectedVideoTitle', data.name);
          video.load();
          video.play().catch(() => {});
        }
      });
      if (!found) alert('Channel not found: ' + streamSlug);
    } else {
      alert('No channels available in database');
    }
  }).catch(() => alert('Failed to load stream data'));
} else {
  alert('No stream specified');
}

// --- Controls Overlay Logic ---
function showControls() {
  controlsOverlay.classList.add('active');
  clearTimeout(controlsTimeout);

  if (window.innerHeight > window.innerWidth) {
    // Portrait → hide after 3s
    controlsTimeout = setTimeout(hideControls, 3000);
  }
}
function hideControls() {
  if (window.innerHeight > window.innerWidth) {
    controlsOverlay.classList.remove('active');
  }
}

video.addEventListener('click', () => {
  if (controlsOverlay.classList.contains('active')) hideControls();
  else showControls();
});

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    controlsOverlay.classList.add('active'); // Always visible in fullscreen
    clearTimeout(controlsTimeout);
  } else {
    showControls();
  }
});

// --- Player Controls ---
playPauseBtn.addEventListener('click', () => video.paused ? video.play() : video.pause());
video.addEventListener('play', () => playPauseBtn.innerHTML = '<span class="material-icons">pause</span>');
video.addEventListener('pause', () => playPauseBtn.innerHTML = '<span class="material-icons">play_arrow</span>');

video.addEventListener('timeupdate', () => {
  seekBar.value = (video.currentTime / video.duration) * 100 || 0;
  currentTimeText.textContent = formatTime(video.currentTime);
  totalTimeText.textContent = formatTime(video.duration);
});
seekBar.addEventListener('input', () => video.currentTime = (seekBar.value / 100) * video.duration);

volumeBar.addEventListener('input', () => {
  video.volume = volumeBar.value;
  video.muted = video.volume === 0;
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    video.parentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
  } else {
    document.exitFullscreen();
    if (screen.orientation?.unlock) screen.orientation.unlock();
  }
});

// Back button
goBack.addEventListener('click', () => window.history.back());

// --- Zoom (pinch + wheel) ---
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
video.addEventListener('touchend', e => { if (e.touches.length < 2) initialDistance = null; });

// Fullscreen styles
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

// Auto fullscreen on landscape
function handleOrientation() {
  if (window.innerWidth > window.innerHeight) {
    if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
  } else {
    if (document.fullscreenElement) document.exitFullscreen();
  }
}
window.addEventListener('resize', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);

// Autoplay & settings
video.autoplay = true;
video.muted = false;
video.playsInline = true;

// Init
showControls();