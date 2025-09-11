import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const video = document.getElementById('video');
const videoTitle = document.getElementById('videoTitle');
const addFavBtn = document.getElementById('addFav');
const removeFavBtn = document.getElementById('removeFav');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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

// Helper to get query param
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

// Initialize Shaka Player
async function initPlayer(streamUrl) {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    alert('Browser not supported by Shaka Player');
    return;
  }

  const player = new shaka.Player(video);

  // Attach player UI
  const ui = new shaka.ui.Overlay(player, document.getElementById('video-container'), video);
  ui.getControls();

  // Configure player for HLS and streaming options
  player.configure({
    streaming: {
      rebufferingGoal: 15,
      bufferingGoal: 30,
      retryParameters: { maxAttempts: 5, baseDelay: 1000, backoffFactor: 2 }
    },
    manifest: {
      dash: { ignoreMinBufferTime: true }
    }
  });

  try {
    await player.load(streamUrl);
    console.log('The video has now been loaded!');
  } catch (error) {
    console.error('Error loading video', error);
    alert('Failed to load video stream.');
  }
}

// Load stream info from Firebase and initialize player
async function loadStream() {
  let streamSlug = qs('stream');
  if (streamSlug) {
    streamSlug = streamSlug.replace(/-/g, ' ').toLowerCase();
  }

  if (!streamSlug) {
    alert('No stream specified');
    return;
  }

  try {
    const channelsRef = ref(db, 'channels');
    const snapshot = await get(channelsRef);
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(childSnap => {
        const data = childSnap.val();
        if (data.name && data.name.toLowerCase() === streamSlug) {
          found = true;
          videoTitle.textContent = data.name || 'Live Stream';
          localStorage.setItem('selectedVideo', data.stream);
          localStorage.setItem('selectedVideoTitle', data.name || 'Live Stream');
          initPlayer(data.stream);
        }
      });
      if (!found) {
        alert('Channel not found: ' + streamSlug);
      }
    } else {
      alert('No channels available in database');
    }
  } catch (err) {
    console.error('Firebase read failed:', err);
    alert('Failed to load stream data');
  }
}

// Favorites management
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

addFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  const videoTitleStored = localStorage.getItem('selectedVideoTitle') || 'Unknown';
  if (!videoSrc) return;
  // Avoid duplicates
  if (!favorites.some(fav => fav.src === videoSrc)) {
    favorites.push({
      title: videoTitleStored,
      src: videoSrc,
      thumb: '',
      category: 'Unknown'
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavButtons();
  }
});

removeFavBtn.addEventListener('click', () => {
  const videoSrc = localStorage.getItem('selectedVideo');
  favorites = favorites.filter(fav => fav.src !== videoSrc);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStream();
  updateFavButtons();
});
