import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');
const addFavBtn = document.getElementById('addFav');
const removeFavBtn = document.getElementById('removeFav');
const container = document.getElementById('videoContainer');
const header = document.querySelector('header');
const favoritesSocial = document.querySelector('.favorites-social');

let controlsTimeout, scale = 1, initialDistance = null;

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb"
};
initializeApp(firebaseConfig);
const db = getDatabase();

// Load video from Firebase
function qs(name){ return new URL(location.href).searchParams.get(name); }
let streamSlug = qs('stream');
if(streamSlug) streamSlug = streamSlug.replace(/-/g,' ').toLowerCase();

if(!streamSlug) alert('No stream specified');
else {
  get(ref(db, 'channels')).then(snapshot=>{
    if(snapshot.exists()){
      let found=false;
      snapshot.forEach(child=>{
        const data = child.val();
        if(data.name && data.name.toLowerCase()===streamSlug){
          found=true;
          video.src = data.stream;
          videoTitle.textContent = data.name||'Live Stream';
          localStorage.setItem('selectedVideo', data.stream);
          localStorage.setItem('selectedVideoTitle', data.name||'Live Stream');
          video.load();
          video.play().catch(()=>{});
        }
      });
      if(!found) alert('Channel not found: '+streamSlug);
    } else alert('No channels available');
  }).catch(()=>alert('Failed to load stream data'));
}

// --- Controls ---
playBtn.addEventListener('click', ()=>{ 
  if(video.paused){ video.play(); playBtn.textContent='pause'; } 
  else { video.pause(); playBtn.textContent='play_arrow'; } 
});

// Fullscreen toggle
fsBtn.addEventListener('click', ()=>{
  container.classList.toggle('fullscreen');
  controls.classList.toggle('fullscreen-controls');
  header.classList.toggle('hidden');
  favoritesSocial.classList.toggle('hidden');
});

// Mute & volume
muteBtn.addEventListener('click', ()=>{ 
  video.muted = !video.muted; 
  muteBtn.textContent = video.muted?'volume_off':'volume_up'; 
});
volumeSlider.addEventListener('input', ()=>{
  video.volume = volumeSlider.value;
  video.muted = video.volume===0;
  muteBtn.textContent = video.muted?'volume_off':'volume_up';
});

// Controls auto-hide
const showControls = ()=>{
  controls.classList.remove('hidden');
  clearTimeout(controlsTimeout);
  if(window.matchMedia("(orientation: landscape)").matches)
    controlsTimeout = setTimeout(()=>controls.classList.add('hidden'),3000);
};
video.addEventListener('mousemove',showControls);
video.addEventListener('touchstart',showControls);

// Portrait mode centering
function updateOrientation(){
  if(window.matchMedia("(orientation: portrait)").matches){
    document.body.classList.add('portrait-center');
    container.style.maxHeight='80vh';
    header.style.display='none';
    favoritesSocial.style.display='none';
  } else {
    document.body.classList.remove('portrait-center');
    container.style.maxHeight='60vh';
    header.style.display='';
    favoritesSocial.style.display='';
  }
}
window.addEventListener('orientationchange', updateOrientation);
window.addEventListener('resize', updateOrientation);
document.addEventListener('DOMContentLoaded', updateOrientation);

// Favorites
let favorites = JSON.parse(localStorage.getItem('favorites'))||[];
function updateFavButtons(){
  const videoSrc = localStorage.getItem('selectedVideo');
  const isFav = favorites.some(fav=>fav.src===videoSrc);
  addFavBtn.classList.toggle('hidden',isFav);
  removeFavBtn.classList.toggle('hidden',!isFav);
}
updateFavButtons();
addFavBtn.addEventListener('click',()=>{
  const videoSrc = localStorage.getItem('selectedVideo');
  const videoTitleStored = localStorage.getItem('selectedVideoTitle')||'Unknown';
  if(!videoSrc) return;
  favorites.push({title:videoTitleStored,src:videoSrc,thumb:'',category:'Unknown'});
  localStorage.setItem('favorites',JSON.stringify(favorites));
  updateFavButtons();
});
removeFavBtn.addEventListener('click',()=>{
  const videoSrc = localStorage.getItem('selectedVideo');
  favorites = favorites.filter(fav=>fav.src!==videoSrc);
  localStorage.setItem('favorites',JSON.stringify(favorites));
  updateFavButtons();
});