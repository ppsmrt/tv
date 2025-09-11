import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// DOM
const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const controls = document.getElementById('controls');
const videoTitle = document.getElementById('videoTitle');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('statusText');
const qualitySelect = document.getElementById('qualitySelect');

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

// Get ?stream=query
function qs(name){ const u = new URL(location.href); return u.searchParams.get(name); }
let streamSlug = qs('stream'); if(streamSlug) streamSlug = streamSlug.replace(/-/g,' ').toLowerCase();

// Shaka-only player state
let shakaPlayer = null;
let activeUrl = null;
let retryCount = 0;

// UI helpers
function showSpinner(){ overlay.innerHTML = '<div class="spinner"></div>'; }
function hideOverlay(){ overlay.innerHTML = ''; }
function showError(msg){
  overlay.innerHTML = `<div class="error-overlay"><div class="text-center p-4"><h3 class="text-lg font-semibold mb-2">Stream Error</h3><div class="mb-2">${msg}</div><button id="retryBtn" class="px-4 py-2 rounded bg-red-600">Retry</button></div></div>`;
  const retryBtn = document.getElementById('retryBtn');
  if(retryBtn) retryBtn.addEventListener('click', ()=>{ overlay.innerHTML=''; initPlayer(activeUrl, videoTitle.textContent); });
}
function setStatus(txt){ statusText.textContent = txt; }

// ---------------- Shaka Loader ----------------
async function loadShaka(url){
  cleanupPlayer();
  activeUrl = url;
  setStatus('Initializing Shaka Player');

  if(!shaka.Player.isBrowserSupported()){
    video.src = url; try{ await video.play(); setStatus('Playing (native)'); }catch(e){ showError('Shaka not supported'); }
    return;
  }

  shaka.polyfill.installAll();
  shakaPlayer = new shaka.Player(video);

  shakaPlayer.configure({
    streaming:{ retryParameters:{ maxAttempts:8, baseDelay:1000, backoffFactor:1.5, fuzzFactor:0.5 }, bufferingGoal:30, rebufferingGoal:6, stallThreshold:2 },
    manifest:{ retryParameters:{ maxAttempts:6 }},
    abr:{ enabled:true, defaultBandwidthEstimate:5e6 }
  });

  shakaPlayer.addEventListener('error', e=>{
    console.error('Shaka error', e.detail);
    showError('Playback error: '+(e.detail?.code || 'unknown'));
  });

  try{
    await shakaPlayer.load(url);
    setStatus('Playing');
    populateTracks();
  }catch(e){
    console.error('Shaka load failed', e);
    showError('Failed to load stream');
  }
}

function populateTracks(){
  if(!shakaPlayer) return;
  const tracks = shakaPlayer.getVariantTracks().filter(t=>t.type==='variant');
  const unique = [];
  tracks.forEach(t=>{ if(!unique.some(u=>u.height===t.height && u.bandwidth===t.bandwidth)) unique.push(t); });
  qualitySelect.innerHTML = '<option value="auto">Auto</option>'+unique.map(t=>`<option value="${t.id}">${t.height?t.height+'p':''} ${Math.round(t.bandwidth/1000)}kbps</option>`).join('');
  qualitySelect.onchange = ()=>{
    const val = qualitySelect.value;
    if(val==='auto') shakaPlayer.configure({abr:{enabled:true}});
    else{
      shakaPlayer.configure({abr:{enabled:false}});
      const track = shakaPlayer.getVariantTracks().find(t=>String(t.id)===String(val));
      if(track) shakaPlayer.selectVariantTrack(track,true);
    }
  };
}

function cleanupPlayer(){
  if(shakaPlayer){ try{ shakaPlayer.unload(); shakaPlayer.destroy(); }catch(e){} shakaPlayer=null; }
  video.removeAttribute('src'); video.load();
}

function retryOrFail(action){
  retryCount++; if(retryCount<=6){ setTimeout(()=>{action();}, Math.min(1000*Math.pow(1.5,retryCount),20000)); }
  else showError('Multiple retries failed. Please try again later.');
}

// ---------------- Controls ----------------
playBtn.addEventListener('click', ()=>{ if(video.paused){ video.play(); playBtn.textContent='pause'; }else{ video.pause(); playBtn.textContent='play_arrow'; } });
fsBtn.addEventListener('click', ()=>{ if(!document.fullscreenElement) video.parentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{}); else document.exitFullscreen(); });
muteBtn.addEventListener('click', ()=>{ video.muted=!video.muted; muteBtn.textContent=video.muted?'volume_off':'volume_up'; });
volumeSlider.addEventListener('input', ()=>{ video.volume=parseFloat(volumeSlider.value); video.muted=video.volume===0; muteBtn.textContent=video.muted?'volume_off':'volume_up'; });

let controlsTimeout = null;
function showControls(){ controls.classList.remove('hidden'); clearTimeout(controlsTimeout); controlsTimeout=setTimeout(()=>controls.classList.add('hidden'),4000); }
document.addEventListener('mousemove', showControls); document.addEventListener('touchstart', showControls);

video.addEventListener('waiting', ()=>{ showSpinner(); setStatus('Buffering...'); });
video.addEventListener('playing', ()=>{ hideOverlay(); setStatus('Playing'); playBtn.textContent='pause'; });
video.addEventListener('pause', ()=>{ playBtn.textContent='play_arrow'; setStatus('Paused'); });

// ---------------- Load from Firebase ----------------
async function initPlayer(url, title){
  videoTitle.textContent = title||'Live Stream';
  setStatus('Resolving stream');
  showSpinner();
  retryCount=0;

  try{
    url=String(url).trim();
    activeUrl=url;
    await loadShaka(url);
  }finally{ hideOverlay(); }
}

if(!streamSlug){ alert('No stream specified'); }
else{
  const channelsRef = ref(db,'channels');
  get(channelsRef).then(snapshot=>{
    if(snapshot.exists()){
      let found=false;
      snapshot.forEach(childSnap=>{
        const data = childSnap.val();
        if(data.name && data.name.toLowerCase()===streamSlug){
          found=true;
          const streamURL = data.stream;
          const streamTitle = data.name || 'Live Stream';
          localStorage.setItem('selectedVideo', streamURL);
          localStorage.setItem('selectedVideoTitle', streamTitle);
          initPlayer(streamURL, streamTitle);
        }
      });
      if(!found) alert('Channel not found: '+streamSlug);
    }else alert('No channels available');
  }).catch(err=>{ console.error('Firebase error',err); alert('Failed to load channels'); });
      }
