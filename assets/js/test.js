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

function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

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
          const videoUrl = data.stream;
          document.getElementById('videoTitle').textContent = data.name || 'Live Stream';
          loadShakaOrNative(videoUrl);
        }
      });
      if (!found) alert('Channel not found: ' + streamSlug);
    } else {
      alert('No channels available in database');
    }
  }).catch(err => console.error(err));
}

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

    player.load(url).then(()=> {
      console.log('Stream loaded with Shaka Player!');
    }).catch(err => {
      console.error('Shaka Player error:', err);
      video.src = url;
      video.play().catch(()=>{});
    });
  } else {
    video.src = url;
    video.play().catch(()=>{});
  }

  // --- Orientation and aspect ratio handling ---
  function updateVideoLayout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (vw < vh) {
      // Portrait: force 16:9 box
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

    // Auto fullscreen on tap for mobile
    if (!document.fullscreenElement) {
      container.requestFullscreen({ navigationUI: 'hide' }).catch(()=>{});
      if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(()=>{});
    }
  });
}