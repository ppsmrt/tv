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

// Get stream slug from URL
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
      if (!found) {
        alert('Channel not found: ' + streamSlug);
      }
    } else {
      alert('No channels available in database');
    }
  }).catch(err => {
    console.error('Firebase read failed:', err);
    alert('Failed to load stream data');
  });
}

// Load stream with Shaka Player
async function loadStream(url, title) {
  try {
    const player = new shaka.Player(video);
    const ui = new shaka.ui.Overlay(player, document.getElementById('video-container'), video);

    // UI config
    ui.getControls();
    player.configure({
      streaming: {
        retryParameters: { maxAttempts: Infinity }
      }
    });

    await player.load(url);
    videoTitle.textContent = title || "Live Stream";
    console.log("Stream loaded:", url);
  } catch (e) {
    console.error("Error loading stream:", e);
    alert("Playback failed. Please try again.");
  }
}