import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
  const rootRef = ref(db);

  // Recursive search function
  async function findChannel(snapshot) {
    if (!snapshot.exists()) return null;

    let found = null;

    function traverse(node) {
      if (found) return; // stop if already found
      node.forEach(child => {
        const data = child.val();
        if (data && data.name && data.stream) {
          const slug = data.name.toLowerCase();
          if (slug === streamSlug) {
            found = data;
          }
        }
        if (child.hasChildren()) traverse(child);
      });
    }

    traverse(snapshot);
    return found;
  }

  get(rootRef).then(snapshot => {
    findChannel(snapshot).then(channel => {
      if (channel) {
        document.getElementById('videoTitle').textContent = channel.name || 'Live Stream';
        loadShakaOrNative(channel.stream);
      } else {
        alert('Channel not found: ' + streamSlug);
      }
    });
  }).catch(err => console.error('Firebase read failed:', err));
}

// --- Shaka Player or fallback ---
function loadShakaOrNative(url) {
  const video = document.getElementById('video');

  const isHLS = url.endsWith('.m3u8');
  const isDASH = url.endsWith('.mpd');

  if (isHLS || isDASH) {
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      video.src = url;
      video.play().catch(()=>{});
      return;
    }

    const player = new shaka.Player(video);

    if (!video.parentElement._shakaUI) {
      const ui = new shaka.ui.Overlay(player, document.getElementById('videoContainer'), video);
      ui.getControls();
      video.parentElement._shakaUI = ui;
    }

    player.load(url).then(()=> console.log('Stream loaded with Shaka Player!'))
      .catch(err => {
        console.error('Shaka Player error:', err);
        video.src = url;
        video.play().catch(()=>{});
      });
  } else {
    video.src = url;
    video.play().catch(()=>{});
  }

  // --- Orientation and aspect ratio ---
  function updateVideoLayout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (vw < vh) {
      // Portrait: 16:9
      video.style.width = '100%';
      video.style.height = 'auto';
      const h = vw * 9 / 16;
      video.style.maxHeight = `${h}px`;
    } else {
      // Landscape: fullscreen
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
    }
  }

  window.addEventListener('resize', updateVideoLayout);
  window.addEventListener('orientationchange', updateVideoLayout);
  updateVideoLayout();

  // Auto-hide Shaka controls after 3s
  let controlsTimeout;
  const container = video.parentElement;
  function showControls() {
    if (container._shakaUI) {
      container._shakaUI.getControls().show();
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => {
        container._shakaUI.getControls().hide();
      }, 3000);
    }
  }

  video.addEventListener('mousemove', showControls);
  video.addEventListener('touchstart', showControls);
  video.addEventListener('click', () => {
    showControls();
    if (!document.fullscreenElement) {
      container.requestFullscreen({ navigationUI: 'hide' }).catch(()=>{});
      if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(()=>{});
    }
  });
}