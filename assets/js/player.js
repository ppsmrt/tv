// player.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ✅ Your Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyBJoxttxIrGMSYU-ROjrYng2swbB0owOoA",
  authDomain: "tamilgeo-d10d6.firebaseapp.com",
  projectId: "tamilgeo-d10d6",
  storageBucket: "tamilgeo-d10d6.firebasestorage.app",
  messagingSenderId: "789895210550",
  appId: "1:789895210550:android:63f757c9cac09581275a97"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get video element
const video = document.getElementById("videoPlayer");

// 🔥 Function to load and play .m3u8 streams safely
function loadStream(url) {
  if (Hls.isSupported()) {
    // For browsers that don’t support HLS natively
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => console.log("Autoplay blocked:", err));
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    // For Safari (native HLS support)
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      video.play().catch(err => console.log("Autoplay blocked:", err));
    });
  } else {
    console.error("HLS not supported in this browser");
  }
}

// Example: Load your default channel on startup
loadStream("http://89.187.189.98/KTVHD/index.m3u8");

// 🔥 Firebase logic intact: switch channels dynamically
const channelRef = ref(db, "currentChannel");
onValue(channelRef, (snapshot) => {
  const url = snapshot.val();
  if (url) {
    loadStream(url);
  }
});

// ✅ Keep your UI, mute, fullscreen, favorites, etc. logic intact below
document.getElementById("muteBtn").addEventListener("click", () => {
  video.muted = !video.muted;
});

document.getElementById("fullscreenBtn").addEventListener("click", () => {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) {
    video.msRequestFullscreen();
  }
});

// Pinch zoom support (kept intact)
let scale = 1;
let lastDist = null;

video.addEventListener("touchmove", function (e) {
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

video.addEventListener("touchend", () => {
  lastDist = null;
});