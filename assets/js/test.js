import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');

let controlsTimeout, scale = 1, initialDistance = null;

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

// Query helper
function qs(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

let streamSlug = qs('stream');
if (streamSlug) streamSlug = streamSlug.replace(/-/g,' ').toLowerCase();

// ------------------------
// Universal Player Init
// ------------------------
async function initPlayer(url, title) {
  videoTitle.textContent = title || 'Live Stream';

  if (url.endsWith('.m3u8')) {
    // HLS
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (event, data) => console.error('HLS.js error:', data));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(()=>{});
    } else alert('HLS not supported');
    return;
  }

  if (url.endsWith('.mpd')) {
    // DASH
    if (!shaka.Player.isBrowserSupported()) {
      console.error("Shaka not supported. Using native fallback");
      video.src = url;
      return;
    }
    const player = new shaka.Player(video);
    player.addEventListener('error', e=>console.error('Shaka error', e.detail));
    try { await player.load(url); console.log('DASH loaded'); } 
    catch(e){console.error('DASH load failed', e);}
    return;
  }

  // fallback
  video.src = url;
  video.play().catch(()=>{});
}

// ------------------------
// Load Firebase stream
// ------------------------
if (!streamSlug) {
  alert('No stream specified');
} else {
  const channelsRef = ref(db,'channels');
  get(channelsRef).then(snapshot=>{
    if(snapshot.exists()){
      let found=false;
      snapshot.forEach(childSnap=>{
        const data=childSnap.val();
        if(data.name && data.name.toLowerCase()===streamSlug){
          found=true;
          const streamURL=data.stream;
          const streamTitle=data.name||'Live Stream';
          localStorage.setItem('selectedVideo', streamURL);
          localStorage.setItem('selectedVideoTitle', streamTitle);
          initPlayer(streamURL, streamTitle);
        }
      });
      if(!found) alert('Channel not found: '+streamSlug);
    } else alert('No channels available');
  }).catch(err=>{console.error('Firebase error',err); alert('Failed to load');});
}

// ------------------------
// Controls
// ------------------------
playBtn.addEventListener('click',()=>{
  if(video.paused){ video.play(); playBtn.textContent='pause'; }
  else{ video.pause(); playBtn.textContent='play_arrow'; }
});

fsBtn.addEventListener('click',()=>{
  if(!document.fullscreenElement){
    video.parentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
    if(screen.orientation?.lock) screen.orientation.lock('landscape').catch(()=>{});
  } else {
    document.exitFullscreen();
    if(screen.orientation?.unlock) screen.orientation.unlock();
  }
});

muteBtn.addEventListener('click',()=>{
  video.muted=!video.muted;
  muteBtn.textContent=video.muted?'volume_off':'volume_up';
});
volumeSlider.addEventListener('input',()=>{ video.volume=volumeSlider.value; video.muted=video.volume===0; muteBtn.textContent=video.muted?'volume_off':'volume_up'; });

// ------------------------
// Show/Hide Controls
// ------------------------
const showControls=()=>{
  controls.classList.remove('hidden');
  clearTimeout(controlsTimeout);
  if(window.matchMedia("(orientation: landscape)").matches){
    controlsTimeout=setTimeout(()=>controls.classList.add('hidden'),3000);
  }
};
video.addEventListener('mousemove',showControls);
video.addEventListener('touchstart',showControls);
window.addEventListener('orientationchange',()=>{ controls.classList[window.matchMedia("(orientation: landscape)").matches?'add':'remove']('hidden'); });

// ------------------------
// Pinch/Zoom
// ------------------------
video.addEventListener('wheel', e=>{
  scale+=e.deltaY*-0.001;
  scale=Math.min(Math.max(1,scale),3);
  video.style.transform=`scale(${scale})`;
});
video.addEventListener('touchstart', e=>{
  if(e.touches.length===2) initialDistance=Math.hypot(e.touches[0].pageX-e.touches[1].pageX,e.touches[0].pageY-e.touches[1].pageY);
});
video.addEventListener('touchmove', e=>{
  if(e.touches.length===2 && initialDistance){
    const currDist=Math.hypot(e.touches[0].pageX-e.touches[1].pageX,e.touches[0].pageY-e.touches[1].pageY);
    scale=Math.min(Math.max(1,scale*(currDist/initialDistance)),3);
    video.style.transform=`scale(${scale})`;
    initialDistance=currDist;
  }
});
video.addEventListener('touchend',()=>{ if(event.touches.length<2) initialDistance=null; });

// ------------------------
// Favorites
// ------------------------
const addFavBtn=document.getElementById('addFav');
const removeFavBtn=document.getElementById('removeFav');
let favorites=JSON.parse(localStorage.getItem('favorites'))||[];

function updateFavButtons(){
  const videoSrc=localStorage.getItem('selectedVideo');
  const isFav=favorites.some(fav=>fav.src===videoSrc);
  addFavBtn.classList.toggle('hidden', isFav);
  removeFavBtn.classList.toggle('hidden', !isFav);
}
updateFavButtons();

addFavBtn.addEventListener('click',()=>{
  const videoSrc=localStorage.getItem('selectedVideo');
  const videoTitleStored=localStorage.getItem('selectedVideoTitle')||'Unknown';
  if(!videoSrc) return;
  favorites.push({title:videoTitleStored, src:videoSrc, thumb:'', category:'Unknown'});
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});
removeFavBtn.addEventListener('click',()=>{
  const videoSrc=localStorage.getItem('selectedVideo');
  favorites=favorites.filter(fav=>fav.src!==videoSrc);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavButtons();
});

// ------------------------
// Fullscreen Styling
// ------------------------
function applyFullscreenStyles(){
  if(document.fullscreenElement){
    video.style.width='100%';
    video.style.height='100%';
    video.style.objectFit='cover';
    video.style.transform=`scale(${scale})`;
  } else {
    video.style.width=''; video.style.height=''; video.style.objectFit=''; video.style.transform='';
  }
}
document.addEventListener('fullscreenchange', applyFullscreenStyles);
window.addEventListener('resize', applyFullscreenStyles);
window.addEventListener('orientationchange', applyFullscreenStyles);