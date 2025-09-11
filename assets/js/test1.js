import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const video = document.getElementById('video');
const videoTitle = document.getElementById('videoTitle');

// Firebase Config
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

// Helper
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

let streamSlug = qs('stream');
if (streamSlug) {
  streamSlug = streamSlug.replace(/-/g, ' ').toLowerCase();
}

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
          loadStream(data.stream, data.name);
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

// Force through proxy to fix http + CORS issues
function proxify(url) {
  // Public proxy example (you should replace with your own server for production)
  return "https://corsproxy.io/?" + encodeURIComponent(url);
}

// Load stream with Shaka Player
async function loadStream(url, title) {
  try {
    const player = new shaka.Player(video);
    const ui = new shaka.ui.Overlay(player, document.getElementById('video-container'), video);

    ui.getControls();

    // Max robustness config
    player.configure({
      streaming: {
        retryParameters: { maxAttempts: Infinity, baseDelay: 500, backoffFactor: 2 },
        bufferingGoal: 30,
        rebufferingGoal: 15,
        lowLatencyMode: true
      },
      manifest: { retryParameters: { maxAttempts: Infinity } },
      drm: { retryParameters: { maxAttempts: Infinity } }
    });

    // Proxy the URL
    const finalUrl = proxify(url);

    await player.load(finalUrl);
    videoTitle.textContent = title || "Live Stream";
    console.log("Stream loaded:", finalUrl);

    // Save last working
    localStorage.setItem("lastStream", url);
    localStorage.setItem("lastTitle", title);
  } catch (e) {
    console.error("Error loading stream:", e);
    alert("Playback failed. Please try again.");
  }
}

// Auto fallback to last played
window.addEventListener("DOMContentLoaded", () => {
  if (!streamSlug) {
    const last = localStorage.getItem("lastStream");
    if (last) {
      loadStream(last, localStorage.getItem("lastTitle") || "Last Played");
    }
  }
});