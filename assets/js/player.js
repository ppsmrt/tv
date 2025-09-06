import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const videoContainer = document.getElementById('videoContainer');
const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');

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

// Fullscreen (immersive + Kodular fallback)
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    if(videoContainer.requestFullscreen){
      videoContainer.requestFullscreen({ navigationUI: 'hide' }).catch(()=>{});
    } else if(video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else if(video.msRequestFullscreen) {
      video.msRequestFullscreen();
    } else {
      // 🚀 Kodular / WebView fallback fullscreen
      if (videoContainer.classList.contains("css-fullscreen")) {
        videoContainer.classList.remove("css-fullscreen");
        screen.orientation.unlock?.();
      } else {
        videoContainer.classList.add("css-fullscreen");
        screen.orientation.lock?.("landscape").catch(()=>{});
      }
    }
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(()=>{});
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else {
      // 🚀 Exit Kodular / WebView fallback
      videoContainer.classList.remove("css-fullscreen");
      screen.orientation.unlock?.();
    }
  }
});

// Mute/Unmute
muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});

// Volume Slider
volumeSlider.addEventListener('input', e => {
  video.volume = e.target.value;
  video.muted = video.volume === 0;
  muteBtn.textContent = video.muted ? 'volume_off' : 'volume_up';
});

// Controls auto-hide
function showControls(){
  controls.style.opacity=1;
  controls.style.pointerEvents='auto';
  clearTimeout(controlsTimeout);
  controlsTimeout=setTimeout(()=>{
    controls.style.opacity=0;
    controls.style.pointerEvents='none';
  },3000);
}
video.addEventListener('mousemove',showControls);
video.addEventListener('touchstart',showControls);
showControls();