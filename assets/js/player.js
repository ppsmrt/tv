import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// Fullscreen (immersive)
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    if(video.parentElement.requestFullscreen){
      video.parentElement.requestFullscreen({ navigationUI: 'hide' }).catch(()=>{});
    } else if(video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else if(video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(()=>{});
    }
  } else {
    document.exitFullscreen();
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }
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

// Auto-hide controls on interaction
const showControls = () => {
  controls.classList.remove('hidden');
  clearTimeout(controlsTimeout);
  if (window.matchMedia("(orientation: landscape)").matches) {
    controlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
  }
};
video.addEventListener('mousemove', showControls);
video.addEventListener('touchstart', showControls);

// Hide controls in landscape by default, visible in portrait
function updateControlsVisibility() {
  if (window.matchMedia("(orientation: landscape)").matches) {
    controls.classList.add('hidden'); // hide in landscape
  } else {
    controls.classList.remove('hidden'); // show in portrait
  }
}
window.addEventListener('orientationchange', updateControlsVisibility);
document.addEventListener('DOMContentLoaded', updateControlsVisibility);

// Tap to toggle controls in landscape
video.addEventListener('click', () => {
  if (window.matchMedia("(orientation: landscape)").matches) {
    if (controls.classList.contains('hidden')) {
      controls.classList.remove('hidden');
      clearTimeout(controlsTimeout);
      controlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
    } else {
      controls.classList.add('hidden');
    }
  }
});

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
function applyFullscreenStyles() {
  if(document.fullscreenElement){
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.transform = `scale(${scale})`;
  } else {
    video.style.width = '';
    video.style.height = '';
    video.style.objectFit = '';
    video.style.transform = '';
  }
}
document.addEventListener('fullscreenchange', applyFullscreenStyles);
window.addEventListener('resize', applyFullscreenStyles);
window.addEventListener('orientationchange', applyFullscreenStyles);

// Get current video info from localStorage
const videoSrc = localStorage.getItem('selectedVideo');
const videoTitle = localStorage.getItem('selectedVideoTitle');

// Favorite buttons
const addFavBtn = document.getElementById('addFav');
const removeFavBtn = document.getElementById('removeFav');

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Update button visibility
function updateFavButtons() {
  const isFav = favorites.some(fav => fav.src === videoSrc);
  if(isFav){
    addFavBtn.classList.add('hidden');
    removeFavBtn.classList.remove('hidden');
  } else {
    addFavBtn.classList.remove('hidden');
    removeFavBtn.classList.add('hidden');
  }
}

updateFavButtons();

// Add to favorites
addFavBtn.addEventListener('click', () => {
  const newFav = {
    title: videoTitle,
    src: videoSrc,
    thumb: '', // optional thumbnail
    category: 'Unknown'
  };
  favorites.push(newFav);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

// Remove from favorites
removeFavBtn.addEventListener('click', () => {
  favorites = favorites.filter(fav => fav.src !== videoSrc);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});