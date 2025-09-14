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

// Helper function to get URL param
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

// Convert slug → normalized (lowercase, replace - with space)
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
          initializeShakaPlayer(data.stream);
          videoTitle.textContent = data.name || 'Live Stream';
          localStorage.setItem('selectedVideo', data.stream);
          localStorage.setItem('selectedVideoTitle', data.name || 'Live Stream');
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

// Initialize Shaka Player with Premium UI and Controls
function initializeShakaPlayer(streamUrl) {
  if (!shaka.Player.isBrowserSupported()) {
    alert('Browser not supported by Shaka Player');
    return;
  }

  // Create the player instance
  const player = new shaka.Player(video);

  // Attach the UI controls
  const ui = new shaka.ui.Overlay(player, document.getElementById('player-container'), video);
  ui.getControls();

  // Configure premium UI options (example)
  ui.configure({
    controlPanelElements: [
      'play_pause',
      'time_and_duration',
      'spacer',
      'mute',
      'volume',
      'fullscreen',
      'overflow_menu'
    ],
    overflowMenuButtons: [
      'captions',
      'quality',
      'picture_in_picture',
      'cast',
      'playback_rate'
    ],
    addSeekBar: true,
    enableKeyboardPlaybackControls: true,
  });

  // Load the stream
  player.load(streamUrl).then(() => {
    // Autoplay after load
    video.play().catch(() => {});
  }).catch(error => {
    console.error('Error loading video:', error);
    alert('Failed to load video stream');
  });

  // Optional: Listen for errors
  player.addEventListener('error', event => {
    console.error('Shaka Player error:', event.detail);
  });
}