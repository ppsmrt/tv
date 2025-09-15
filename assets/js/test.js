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
const channelInfo = document.getElementById('channelInfo');
const channelNameEl = document.getElementById('channelName');
const channelLogoBox = channelInfo?.querySelector('.channel-logo');

let controlsTimeout, scale = 1, initialDistance = null;

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get stream from URL
function qs(name) { return new URL(location.href).searchParams.get(name); }
let streamSlug = qs('stream')?.replace(/-/g, ' ').toLowerCase();
if (!streamSlug) {
  alert('No stream specified');
} else {
  get(ref(db, 'channels')).then(snapshot => {
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(child => {
        const data = child.val();
        if (data.name?.toLowerCase() === streamSlug) {
          found = true;

          // 🎥 Setup video
          video.src = data.stream;
          channelNameEl.textContent = data.name;

          // 🖼 Channel logo or fallback
          if (channelLogoBox) {
            if (data.logo) {
              channelLogoBox.innerHTML = `<img src="${data.logo}" alt="${data.name}" class="w-12 h-12 rounded-lg object-cover"/>`;
            } else {
              channelLogoBox.textContent = data.name.charAt(0).toUpperCase();
            }
          }

          // Save to localStorage
          localStorage.setItem('selectedVideo', data.stream);
          localStorage.setItem('selectedVideoTitle', data.name);

          // Autoplay
          video.load();
          video.play().catch(() => { });
        }
      });
      if (!found) alert('Channel not found: ' + streamSlug);
    } else alert('No channels available in database');
  }).catch(err => alert('Failed to load stream data'));
}

// Controls
function showControls() {
  controlsOverlay.classList.add('active');
  if (channelInfo) channelInfo.classList.add('show');
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(hideControls, 3000);
}
function hideControls() {
  controlsOverlay.classList.remove('active');
  if (channelInfo) channelInfo.classList.remove('show');
}
video.addEventListener('click', () =>
  controlsOverlay.classList.contains('active') ? hideControls() : showControls()
);
showControls();

// Play/Pause
playPauseBtn.addEventListener('click', () => video.paused ? video.play() : video.pause());
video.addEventListener('play', () => playPauseBtn.innerHTML = '<span class="material-icons">pause</span>');
video.addEventListener('pause', () => playPauseBtn.innerHTML = '<span class="material-icons">play_arrow</span>');

// Seek & Volume
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

// Fullscreen & Orientation
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) video.parentElement.requestFullscreen().catch(() => { });
  else document.exitFullscreen();
});
window.addEventListener('resize', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);
function handleOrientation() {
  if (window.innerWidth > window.innerHeight && !document.fullscreenElement) video.requestFullscreen().catch(() => { });
}

// Go back
goBack.addEventListener('click', () => window.history.back());

// Time formatting
function formatTime(s) {
  const m = Math.floor(s / 60),
    sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' + sec : sec}`;
}

// Pinch & wheel zoom
video.addEventListener('wheel', e => {
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(1, scale), 3);
  video.style.transform = `scale(${scale})`;
});
video.addEventListener('touchstart', e => {
  if (e.touches.length === 2)
    initialDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
});
video.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && initialDistance) {
    const cur = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    scale = Math.min(Math.max(1, scale * (cur / initialDistance)), 3);
    video.style.transform = `scale(${scale})`;
    initialDistance = cur;
  }
});
video.addEventListener('touchend', e => { if (e.touches.length < 2) initialDistance = null; });