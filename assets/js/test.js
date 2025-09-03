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

const streamSlug = qs('stream');

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
  video.src = match.url;
  video.setAttribute('playsinline','');
  video.load();
  video.play().catch(err => console.warn('Autoplay failed', err));
});

// --- Controls Logic ---

// Play/Pause
playBtn.addEventListener('click', () => {
  if(video.paused){ 
    video.play(); 
    playBtn.textContent='pause'; 
  } else { 
    video.pause(); 
    playBtn.textContent='play_arrow'; 
  }
});

// Fullscreen
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    if(video.parentElement.requestFullscreen) video.parentElement.requestFullscreen();
    else if(video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else if(video.msRequestFullscreen) video.msRequestFullscreen();
  } else document.exitFullscreen();
});

// Mute / Volume
muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});
volumeSlider.addEventListener('input', () => {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});

// Auto-hide controls
const showControls = () => {
  controls.classList.remove('hidden');
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
};
video.addEventListener('mousemove', showControls);
video.addEventListener('touchstart', showControls);

// Pinch / Wheel Zoom
video.addEventListener('wheel', e => {
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(1, scale), 3);
  video.style.transform = `scale(${scale})`;
});

video.addEventListener('touchstart', e => {
  if(e.touches.length === 2){
    initialDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
  }
});
video.addEventListener('touchmove', e => {
  if(e.touches.length === 2 && initialDistance){
    const currentDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    scale = Math.min(Math.max(1, scale * (currentDistance/initialDistance)),3);
    video.style.transform = `scale(${scale})`;
    initialDistance = currentDistance;
  }
});
video.addEventListener('touchend', e => { if(e.touches.length < 2) initialDistance=null; });

// Maintain fullscreen scaling on resize/orientation change
window.addEventListener('resize', () => {
  if(document.fullscreenElement){
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
  }
});
window.addEventListener('orientationchange', () => {
  if(document.fullscreenElement){
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
  }
});