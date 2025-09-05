<!-- Include HLS.js -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');
const extraInfo = document.getElementById('extraInfo');

let controlsTimeout;
let scale = 1;
let initialDistance = null;
let hlsInstance = null;

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

// Helper functions
function qs(name){ const u=new URL(location.href); return u.searchParams.get(name); }
function slugify(name){ return name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'); }

// ✅ Convert HTTP URL to HTTPS using proxy
function makeSecureURL(url){
  if(url.startsWith('https://')) return url;
  return `https://cors-proxy.elfsight.com/?url=${encodeURIComponent(url)}`;
}

const streamSlug = qs('stream');

// Function to play HLS URL
function playStream(url) {
  if(hlsInstance){
    hlsInstance.destroy();
    hlsInstance = null;
  }

  const finalURL = makeSecureURL(url); // ✅ Always use secure proxy if needed

  if(Hls.isSupported()){
    hlsInstance = new Hls();
    hlsInstance.loadSource(finalURL);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(err => console.warn('Autoplay failed', err)));
  } else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src = finalURL;
    video.play().catch(err => console.warn('Autoplay failed', err));
  } else {
    console.error('HLS not supported in this browser.');
  }
}

// Fetch stream data from Firebase
const channelsRef = ref(db, 'channels');
onValue(channelsRef, snapshot => {
  if(!snapshot.exists()) return;
  const data = snapshot.val();
  const list = Object.values(data).map(c => ({
    name: c.name,
    url: c.stream,
    host: c.host,
    genre: c.genre,
    viewers: c.viewers
  }));

  let match = list.find(ch => slugify(ch.name) === streamSlug);
  if(!match) match = list.find(ch => slugify(ch.name).includes(streamSlug));
  if(!match) return;

  videoTitle.textContent = match.name;
  extraInfo.textContent = `Host: ${match.host || 'N/A'} | Genre: ${match.genre || 'N/A'} | Viewers: ${match.viewers || '0'}`;

  playStream(match.url);
  video.setAttribute('playsinline','');
});

// --- Your original player controls remain unchanged ---
</script>