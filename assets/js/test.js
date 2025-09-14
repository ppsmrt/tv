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

let controlsTimeout, scale = 1, initialDistance = null, shakaPlayer = null, shakaLoadedManifest = null;
video.controls = false;

/* Firebase Config */
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

function qs(name) { return new URL(location.href).searchParams.get(name); }
function initShaka() {
  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) return;
  if (shakaPlayer) { try { shakaPlayer.destroy(); } catch(e){} shakaPlayer=null; }
  shakaPlayer = new shaka.Player(video);
  shakaPlayer.configure({
    streaming:{rebufferingGoal:4, bufferingGoal:30},
    abr:{enabled:true, defaultBandwidthEstimate:1000000},
    manifest:{retryParameters:{maxAttempts:2}}
  });
  shakaPlayer.addEventListener('error', e=>console.error('Shaka error', e.detail||e));
}
async function loadWithShakaOrFallback(url){
  if(!url) return;
  shakaLoadedManifest=null;
  if(window.shaka && shaka.Player.isBrowserSupported()){
    try{ await shakaPlayer.load(url); shakaLoadedManifest=url; await video.play(); return; }
    catch(err){ console.warn('Shaka load failed', err); try{shakaPlayer.destroy();}catch(e){} shakaPlayer=null; }
  }
  video.src=url; video.load(); try{ await video.play(); }catch(e){}
}

/* ------------------- Load Stream ------------------- */
let streamSlug = qs('stream');
if(streamSlug) streamSlug=streamSlug.replace(/-/g,' ').toLowerCase();
if(!streamSlug) alert('No stream specified');
else {
  const channelsRef=ref(db,'channels');
  get(channelsRef).then(snapshot=>{
    if(snapshot.exists()){
      let found=false;
      snapshot.forEach(childSnap=>{
        const data=childSnap.val();
        if(data.name && data.name.toLowerCase()===streamSlug){
          found=true;
          const streamUrl=data.stream, title=data.name||'Live Stream';
          videoTitle.textContent=title;
          localStorage.setItem('selectedVideo', streamUrl);
          localStorage.setItem('selectedVideoTitle', title);
          initShaka();
          loadWithShakaOrFallback(streamUrl);
        }
      });
      if(!found) alert('Channel not found: '+streamSlug);
    }else alert('No channels available in database');
  }).catch(err=>{console.error('Firebase read failed:',err); alert('Failed to load stream data');});
}

/* ------------------- Controls ------------------- */
playBtn.addEventListener('click',async()=>{ if(video.paused){ try{ await video.play(); playBtn.textContent='pause'; }catch(e){ playBtn.textContent='play_arrow'; }} else{ video.pause(); playBtn.textContent='play_arrow'; }});
fsBtn.addEventListener('click',()=>{
  if(document.fullscreenElement||video.webkitDisplayingFullscreen){ document.exitFullscreen?.(); video.webkitExitFullscreen?.(); container.style.width='100%'; container.style.height='100%'; video.style.width='100%'; video.style.height='100%'; }
  else { container.requestFullscreen?.()??video.webkitEnterFullscreen?.(); container.style.width='100vw'; container.style.height='100vh'; video.style.width='100%'; video.style.height='100%'; }
});
muteBtn.addEventListener('click',()=>{ video.muted=!video.muted; muteBtn.textContent=video.muted?'volume_off':'volume_up'; });
volumeSlider.addEventListener('input',()=>{ video.volume=volumeSlider.value; video.muted=video.volume===0; muteBtn.textContent=video.muted?'volume_off':'volume_up'; });

const showControls=()=>{ controls.classList.remove('hidden'); clearTimeout(controlsTimeout); if(window.matchMedia("(orientation: landscape)").matches) controlsTimeout=setTimeout(()=>controls.classList.add('hidden'),3000);};
video.addEventListener('mousemove',showControls); video.addEventListener('touchstart',showControls);
function updateControlsVisibility(){ if(window.matchMedia("(orientation: landscape)").matches) controls.classList.add('hidden'); else controls.classList.remove('hidden'); }
window.addEventListener('orientationchange',updateControlsVisibility); document.addEventListener('DOMContentLoaded',updateControlsVisibility);
video.addEventListener('click',()=>{ if(window.matchMedia("(orientation: landscape)").matches){ controls.classList.toggle('hidden'); if(!controls.classList.contains('hidden')) controlsTimeout=setTimeout(()=>controls.classList.add('hidden'),3000); }});

video.addEventListener('wheel',e=>{ scale+=e.deltaY*-0.001; scale=Math.min(Math.max(1,scale),3); video.style.transform=`scale(${scale})`; });
video.addEventListener('touchstart',e=>{ if(e.touches.length===2) initialDistance=Math.hypot(e.touches[0].pageX-e.touches[1].pageX,e.touches[0].pageY-e.touches[1].pageY); });
video.addEventListener('touchmove',e=>{ if(e.touches.length===2 && initialDistance){ const currentDistance=Math.hypot(e.touches[0].pageX-e.touches[1].pageX,e.touches[0].pageY-e.touches[1].pageY); scale=Math.min(Math.max(1,scale*(currentDistance/initialDistance)),3); video.style.transform=`scale(${scale})`; initialDistance=currentDistance; }});
video.addEventListener('touchend',e=>{ if(e.touches.length<2) initialDistance=null; });
function applyFullscreenStyles(){ if(document.fullscreenElement||video.webkitDisplayingFullscreen){ video.style.width='100%'; video.style.height='100%'; video.style.objectFit='cover'; video.style.transform=`scale(${scale})`; }else{ video.style.width=''; video.style.height=''; video.style.objectFit=''; video.style.transform=''; }}
document.addEventListener('fullscreenchange',applyFullscreenStyles); window.addEventListener('resize',applyFullscreenStyles); window.addEventListener('orientationchange',applyFullscreenStyles);

/* ------------------- Favorites ------------------- */
let favorites=JSON.parse(localStorage.getItem('favorites'))||[];
function updateFavButtons(){ const videoSrc=localStorage.getItem('selectedVideo'); const isFav=favorites.some(f=>f.src===videoSrc); if(isFav){ addFavBtn.classList.add('hidden'); removeFavBtn.classList.remove('hidden'); }else{ addFavBtn.classList.remove('hidden'); removeFavBtn.classList.add('hidden'); } }
updateFavButtons();
addFavBtn.addEventListener('click',()=>{ const videoSrc=localStorage.getItem('selectedVideo'); const videoTitleStored=localStorage.getItem('selectedVideoTitle')||'Unknown'; if(!videoSrc) return; favorites.push({title:videoTitleStored,src:videoSrc,thumb:'',category:'Unknown'}); localStorage.setItem('favorites',JSON.stringify(favorites)); updateFavButtons(); });
removeFavBtn.addEventListener('click',()=>{ const videoSrc=localStorage.getItem('selectedVideo'); favorites=favorites.filter(f=>f.src!==videoSrc); localStorage.setItem('favorites',JSON.stringify(favorites)); updateFavButtons(); });