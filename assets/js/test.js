import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import Hls from "https://cdn.jsdelivr.net/npm/hls.js@latest"; // official hls.js

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb",
  measurementId: "G-FNS9JWZ9LS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Utility
function qs(name){ const u=new URL(location.href); return u.searchParams.get(name); }
function slugify(name){ return name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'); }

// DOM
const video = document.getElementById('video');
const videoWrap = document.getElementById('videoWrap');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const pipBtn = document.getElementById('pipBtn');
const channelTitle = document.getElementById('channelTitle');
const adTrack = document.getElementById('adTrack');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

let isPlaying=false;
video.volume = 0.5;

// Firebase stream fetch
const streamSlug = qs('stream') || '';
const channelsRef = ref(db, 'channels');

onValue(channelsRef, snapshot => {
  if(!snapshot.exists()) return;
  const data = snapshot.val();
  const list = Object.values(data).map(c=>({ name:c.name, url:c.stream, logo:c.icon }));
  let match = list.find(ch=>slugify(ch.name) === streamSlug) 
           || list.find(ch=>slugify(ch.name).includes(streamSlug));

  if(!match){ channelTitle.textContent = 'Stream not found'; return; }

  channelTitle.textContent = match.name;

  // --- hls.js integration ---
  if (Hls.isSupported()) {
    const hls = new Hls({ debug:false });
    hls.loadSource(match.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(()=>{});
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari / iOS native support
    video.src = match.url;
    video.play().catch(()=>{});
  } else {
    console.error("HLS not supported in this browser.");
  }

  // Ads (kept intact)
  const ads = [
    {img:match.logo, text:`Streaming ${match.name} Live Now!`},
    {img:'https://via.placeholder.com/120x80?text=Ad+2', text:'Subscribe Now'},
    {img:'https://via.placeholder.com/120x80?text=Ad+3', text:'New Shows'}
  ];
  adTrack.innerHTML = '';
  ads.forEach(a=>{
    const div=document.createElement('div');
    div.className='ad-item';
    const im=document.createElement('img'); im.src=a.img; 
    const t=document.createElement('div'); t.textContent=a.text;
    div.appendChild(im); div.appendChild(t);
    adTrack.appendChild(div);
  });
});

// --- Keep all your existing controls logic intact ---
// Play, pause, fullscreen, PiP, gestures, progress bar, etc.