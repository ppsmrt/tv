// Player.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// Utility functions
function qs(name){ const u=new URL(location.href); return u.searchParams.get(name); }
function slugify(name){ return name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'); }

// DOM elements
const video = document.getElementById('video');
const videoWrap = document.getElementById('videoWrap');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const pipBtn = document.getElementById('pipBtn');
const channelTitle = document.getElementById('channelTitle');
const adTrack = document.getElementById('adTrack');
const indicator = document.getElementById('indicator');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

let controlsTimeout, isPlaying=false, lastTap=0;
let pointerDown=false, startX=0, startY=0, currentVolume=0.5, currentBrightness=1;
video.volume = currentVolume;

// Fetch stream from Firebase
const streamSlug = qs('stream') || '';
const channelsRef = ref(db, 'channels');

onValue(channelsRef, snapshot => {
  if(!snapshot.exists()) return;
  const data = snapshot.val();
  const list = Object.values(data).map(c=>({ name:c.name, category:c.category, logo:c.icon, url:c.stream }));
  let match = list.find(ch=>slugify(ch.name) === streamSlug);
  if(!match) match = list.find(ch=>slugify(ch.name).includes(streamSlug));
  if(!match){ channelTitle.textContent = 'Stream not found'; video.src=''; return; }

  channelTitle.textContent = match.name;
  video.src = match.url;
  video.setAttribute('playsinline','');
  video.load();

  // Ad placeholders
  const ads = [
    {img:match.logo, text:`Streaming ${match.name} Live Now!`},
    {img:'https://tvicn.wordpress.com/wp-content/uploads/2025/09/20250903_0045275084995112584913406.png', text:'Premium Player Controls'},
    {img:'https://via.placeholder.com/120x80?text=Ad+2', text:'Subscribe Now'},
    {img:'https://via.placeholder.com/120x80?text=Ad+3', text:'New Shows'}
  ];
  const items = ads.concat(ads);
  adTrack.innerHTML = '';
  items.forEach(a=>{
    const div = document.createElement('div');
    div.className='ad-item';
    const im = document.createElement('img'); im.src=a.img; im.alt=a.text;
    const t = document.createElement('div'); t.textContent = a.text;
    t.style.fontWeight='700';
    div.appendChild(im); div.appendChild(t);
    adTrack.appendChild(div);
  });
});

// Play/pause toggle
function updatePlayButton(){ playBtn.textContent = isPlaying?'pause':'play_arrow'; }

playBtn.addEventListener('click', async e=>{
  e.stopPropagation();
  if(video.paused){ await video.play(); isPlaying=true; } 
  else { video.pause(); isPlaying=false; }
  updatePlayButton();
});

video.addEventListener('play', ()=>{ isPlaying=true; updatePlayButton(); });
video.addEventListener('pause', ()=>{ isPlaying=false; updatePlayButton(); });

// Video time/progress
video.addEventListener('timeupdate', () => {
  if(video.duration){
    const progress = (video.currentTime/video.duration)*100;
    progressBar.style.width = progress+'%';
    currentTimeEl.textContent = new Date(video.currentTime*1000).toISOString().substr(14,5);
    durationEl.textContent = new Date(video.duration*1000).toISOString().substr(14,5);
  }
});

// Fullscreen
fsBtn.addEventListener('click', async e=>{
  e.stopPropagation();
  const el = videoWrap;
  try{
    if(!document.fullscreenElement){
      if(el.requestFullscreen) await el.requestFullscreen();
      else if(el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if(el.msRequestFullscreen) await el.msRequestFullscreen();
    } else {
      if(document.exitFullscreen) await document.exitFullscreen();
      else if(document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if(document.msExitFullscreen) await document.msExitFullscreen();
    }
  } catch(err){ console.warn('Fullscreen failed:', err); }
});

// Picture-in-Picture
pipBtn.addEventListener('click', async e=>{
  e.stopPropagation();
  try{
    if('pictureInPictureEnabled' in document){
      if(video !== document.pictureInPictureElement) await video.requestPictureInPicture();
      else await document.exitPictureInPicture();
    }
  } catch(err){ console.warn('PiP failed',err); }
});

// Gesture: brightness/volume
function showIndicator(text){ indicator.textContent=text; indicator.classList.add('show'); clearTimeout(indicator._timeout); indicator._timeout=setTimeout(()=>indicator.classList.remove('show'),800); }

function onPointerDown(e){
  pointerDown=true;
  startX=e.clientX??e.touches?.[0]?.clientX;
  startY=e.clientY??e.touches?.[0]?.clientY;
  currentVolume=video.volume;
  const computed=window.getComputedStyle(video).getPropertyValue('filter');
  const m=computed.match(/brightness\(([^)]+)\)/);
  currentBrightness=m?parseFloat(m[1]):1;
}
function onPointerMove(e){
  if(!pointerDown) return;
  const x=e.clientX??e.touches?.[0]?.clientX;
  const y=e.clientY??e.touches?.[0]?.clientY;
  const dy=startY-y;
  const delta=dy/200;
  const isLeft=startX<(window.innerWidth/2);
  if(isLeft){
    let b=Math.min(2, Math.max(0.1, currentBrightness+delta));
    video.style.filter=`brightness(${b})`;
    showIndicator(Math.round(b*100)+'% Brightness');
  } else {
    let v=Math.min(1, Math.max(0, currentVolume+delta));
    video.volume=v;
    showIndicator(Math.round(v*100)+'% Volume');
  }
}
function onPointerUp(){ pointerDown=false; }

videoWrap.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// Double tap play/pause
videoWrap.addEventListener('click', async e=>{
  const now = Date.now();
  if(now-lastTap<300){
    if(video.paused) await video.play();
    else video.pause();
  }
  lastTap=now;
});

// Keyboard shortcuts
window.addEventListener('keydown', e=>{
  if(e.code==='Space'){ e.preventDefault(); if(video.paused) video.play(); else video.pause(); }
  if(e.code==='KeyF'){ fsBtn.click(); }
});

// Hide default controls
video.controls=false;

// Auto-play
(async()=>{ try{ await video.play(); isPlaying=true; updatePlayButton(); } catch(e){ } })();

// Optional: pause adTrack animation on hover
adTrack.addEventListener('mouseenter', ()=> adTrack.style.animationPlayState='paused');
adTrack.addEventListener('mouseleave', ()=> adTrack.style.animationPlayState='running');