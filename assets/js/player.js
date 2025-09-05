// player.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJoxttxIrGMSYU-ROjrYng2swbB0owOoA",
  authDomain: "tamilgeo-d10d6.firebaseapp.com",
  databaseURL: "https://tamilgeo-d10d6-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tamilgeo-d10d6",
  storageBucket: "tamilgeo-d10d6.firebasestorage.app",
  messagingSenderId: "789895210550",
  appId: "1:789895210550:android:63f757c9cac09581275a97"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const video = document.getElementById("video"); // Correct ID from your HTML
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fsBtn = document.getElementById("fsBtn");
const videoTitle = document.getElementById("videoTitle");

// HLS loader
function loadStream(url, title = "Video Title") {
  videoTitle.textContent = title;
  if (!url) return;

  // Destroy previous HLS instance if exists
  if (video.hls) {
    video.hls.destroy();
    video.hls = null;
  }

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => console.log("Autoplay blocked")));
    video.hls = hls;
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", () => video.play().catch(() => console.log("Autoplay blocked")));
  } else {
    console.error("HLS not supported in this browser");
  }
}

// Get URL param for stream
const params = new URLSearchParams(window.location.search);
const streamName = params.get("stream");

// Load stream from Firebase
const channelsRef = ref(db, "channels");
onValue(channelsRef, snapshot => {
  if (!snapshot.exists()) return;

  const channels = snapshot.val();
  let selectedChannel = null;

  // Match ?stream= param
  for (const key in channels) {
    const ch = channels[key];
    const safeName = ch.name.toLowerCase().replace(/\s+/g, "-");
    if (streamName === safeName) {
      selectedChannel = ch;
      break;
    }
  }

  // Default to first channel if not found
  if (!selectedChannel) {
    const firstKey = Object.keys(channels)[0];
    selectedChannel = channels[firstKey];
  }

  loadStream(selectedChannel.stream, selectedChannel.name);
});

// Controls
playBtn.addEventListener("click", () => {
  if (video.paused) { video.play(); playBtn.textContent = "pause"; }
  else { video.pause(); playBtn.textContent = "play_arrow"; }
});

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? "volume_off" : "volume_up";
});

volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value;
  video.muted = e.target.value == 0;
  muteBtn.textContent = video.muted ? "volume_off" : "volume_up";
});

fsBtn.addEventListener("click", () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  else if (video.msRequestFullscreen) video.msRequestFullscreen();
});

// Pinch zoom
let scale = 1, lastDist = null;
video.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    if (lastDist) {
      const diff = dist - lastDist;
      scale += diff * 0.002;
      scale = Math.max(1, Math.min(scale, 3));
      video.style.transform = `scale(${scale})`;
    }
    lastDist = dist;
  }
});
video.addEventListener("touchend", () => lastDist = null);