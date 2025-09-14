import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// Helper: Get URL query param
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

// Stream slug
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
          setupShakaPlayer(data.stream);
          document.getElementById('videoTitle').textContent = data.name || 'Live Stream';
        }
      });
      if (!found) alert('Channel not found: ' + streamSlug);
    } else {
      alert('No channels available in database');
    }
  }).catch(err => console.error(err));
}

// --- Shaka Player setup ---
function setupShakaPlayer(streamUrl) {
  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) {
    alert('Shaka Player not supported on this browser');
    return;
  }

  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  // Optional: premium UI controls
  const ui = new shaka.ui.Overlay(player, document.getElementById('videoContainer'), video);
  ui.getControls(); // initialize controls

  // Load the stream
  player.load(streamUrl).then(() => {
    console.log('Stream loaded successfully!');
  }).catch(err => {
    console.error('Shaka Player error:', err);
    alert('Failed to load stream');
  });

  // Fullscreen handling on mobile
  video.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      video.parentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(()=>{});
    }
  });
}