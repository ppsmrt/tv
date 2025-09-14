import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Elements
const video = document.getElementById('videoPlayer');
const miniPlayer = document.getElementById('miniPlayer');
const miniVideo = document.getElementById('miniVideo');
const playPauseBtn = document.getElementById('playPause');
const miniPlayPause = document.getElementById('miniPlayPause');
const seekBar = document.getElementById('seekBar');
const volumeBar = document.getElementById('volumeBar');
const currentTimeText = document.getElementById('currentTime');
const totalTimeText = document.getElementById('totalTime');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const goBack = document.getElementById('goBack');
const controlsOverlay = document.getElementById('controlsOverlay');
const channelInfo = document.getElementById('channelInfo');
const channelNameEl = document.getElementById('channelName');

const addFavBtn = document.getElementById('addFav');
const removeFavBtn = document.getElementById('removeFav');
let controlsTimeout, scale=1, initialDistance=null, favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get stream from URL
function qs(name){ return new URL(location.href).searchParams.get(name); }
let streamSlug = qs('stream')?.replace(/-/g,' ').toLowerCase();
if(!streamSlug) alert('No stream specified');
else {
  get(ref(db,'channels')).then(snapshot=>{
    if(snapshot.exists()){
      let found=false;
      snapshot.forEach(child=>{
        const data = child.val();
        if(data.name?.toLowerCase() === streamSlug){
          found=true;
          video.src = data.stream;
          channelNameEl.textContent = data.name;
          localStorage.setItem('selectedVideo', data.stream);
          localStorage.setItem('selectedVideoTitle', data.name);
          video.load(); video.play().catch(()=>{});
        }
      });
      if(!found) alert('Channel not found: '+streamSlug);
    } else alert('No channels available in database');
  }).catch(err=>alert('Failed to load stream data'));
}

// Controls
function showControls(){
  controlsOverlay.classList.add('active');
  channelInfo.style.transform='translateY(0)';
  clearTimeout(controlsTimeout);
  controlsTimeout=setTimeout(hideControls,3000);
}
function hideControls(){
  controlsOverlay.classList.remove('active');
  channelInfo.style.transform='translateY(10px)';
}
video.addEventListener('click',()=>controlsOverlay.classList.contains('active')?hideControls():showControls());
showControls();

// Play/Pause
playPauseBtn.addEventListener('click',()=>video.paused?video.play():video.pause());
video.addEventListener('play',()=>playPauseBtn.innerHTML='<span class="material-icons">pause</span>');
video.addEventListener('pause',()=>playPauseBtn.innerHTML='<span class="material-icons">play_arrow</span>');

// Seek & Volume
video.addEventListener('timeupdate',()=>{
  seekBar.value=(video.currentTime/video.duration)*100 || 0;
  currentTimeText.textContent=formatTime(video.currentTime);
  totalTimeText.textContent=formatTime(video.duration);
});
seekBar.addEventListener('input',()=>video.currentTime=(seekBar.value/100)*video.duration);
volumeBar.addEventListener('input',()=>{ video.volume=volumeBar.value; video.muted=video.volume===0; });

// Fullscreen & Orientation
fullscreenBtn.addEventListener('click',()=>{ 
  if(!document.fullscreenElement) video.parentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen();
});
window.addEventListener('resize',handleOrientation);
window.addEventListener('orientationchange',handleOrientation);
function handleOrientation(){
  if(window.innerWidth>window.innerHeight && !document.fullscreenElement) video.requestFullscreen().catch(()=>{});
}

// Go back
goBack.addEventListener('click',()=>window.history.back());

// Mini-player
function activateMiniPlayer(){
  miniPlayer.style.opacity='1'; miniPlayer.style.pointerEvents='auto';
  miniVideo.src=video.currentSrc;
  miniVideo.currentTime=video.currentTime;
  miniVideo.play(); video.parentElement.style.display='none';
}
miniPlayPause.addEventListener('click',()=>miniVideo.paused?miniVideo.play():miniVideo.pause());
document.getElementById('closeMini').addEventListener('click',()=>{
  miniVideo.pause();
  miniPlayer.style.opacity='0';
  miniPlayer.style.pointerEvents='none';
  video.parentElement.style.display='flex';
});
setTimeout(activateMiniPlayer,5000);

// Favorites
function updateFavButtons(){
  const videoSrc = localStorage.getItem('selectedVideo');
  const isFav = favorites.some(f=>f.src===videoSrc);
  addFavBtn.classList.toggle('hidden',isFav);
  removeFavBtn.classList.toggle('hidden',!isFav);
}
addFavBtn.addEventListener('click',()=>{
  const videoSrc = localStorage.getItem('selectedVideo');
  const videoTitleStored = localStorage.getItem('selectedVideoTitle') || 'Unknown';
  if(!videoSrc) return;
  favorites.push({title:videoTitleStored,src:videoSrc,thumb:'',category:'Unknown'});
  localStorage.setItem('favorites',JSON.stringify(favorites));
  updateFavButtons();
});
removeFavBtn.addEventListener('click',()=>{
  const videoSrc = localStorage.getItem('selectedVideo');
  favorites = favorites.filter(f=>f.src!==videoSrc);
  localStorage.setItem('favorites',JSON.stringify(favorites));
  updateFavButtons();
});
updateFavButtons();

// Time formatting
function formatTime(s){ const m=Math.floor(s/60), sec=Math.floor(s%60); return `${m}:${sec<10?'0'+sec:sec}`; }

// Pinch & wheel zoom
video.addEventListener('wheel',e=>{ scale+=e.deltaY*-0.001; scale=Math.min(Math.max(1,scale),3); video.style.transform=`scale(${scale})`; });
video.addEventListener('touchstart',e=>{ if(e.touches.length===2) initialDistance=Math.hypot(e.touches[0].pageX-e.touches[1].pageX,e.touches[0].pageY-e.touches[1].pageY); });
video.addEventListener('touchmove',e=>{ if(e.touches.length===2 && initialDistance){ const cur=Math.hypot(e.touches[0].pageX-e.touches[1].pageX,e.touches[0].pageY-e.touches[1].pageY); scale=Math.min(Math.max(1,scale*(cur/initialDistance)),3); video.style.transform=`scale(${scale})`; initialDistance=cur; } });
video.addEventListener('touchend',e=>{ if(e.touches.length<2) initialDistance=null; });