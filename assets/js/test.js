import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const video = document.getElementById('video');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const pipBtn = document.getElementById('pipBtn');
const channelTitle = document.getElementById('channelTitle');

const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const saveBtn = document.getElementById('saveBtn');

const sponsorAdDiv = document.getElementById('sponsorAd');
const sponsorImg = document.getElementById('sponsorImg');
const sponsorLink = document.getElementById('sponsorLink');
const closeSponsor = document.getElementById('closeSponsor');

let isPlaying=false;
let adShown=false;

function qs(name){ const u=new URL(location.href); return u.searchParams.get(name); }
function slugify(name){ return name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-'); }

const streamSlug = qs('stream');
const channelsRef = ref(db,'channels');
onValue(channelsRef,snapshot=>{
  if(!snapshot.exists()) return;
  const data = snapshot.val();
  const list = Object.values(data).map(c=>({ name:c.name, url:c.stream, logo:c.icon }));
  let match=list.find(ch=>slugify(ch.name)===streamSlug);
  if(!match){ match=list.find(ch=>slugify(ch.name).includes(streamSlug)); }
  if(!match){ channelTitle.textContent='Stream not found'; return; }
  channelTitle.textContent=match.name;
  video.src=match.url; video.load();

  // Mid-roll sponsor ad data
  sponsorAd = { img: match.logo, url: "#", text: `Streaming ${match.name} Live Now!` };
});

// Play/Pause
playBtn.addEventListener('click', ()=>{ if(video.paused){ video.play(); isPlaying=true;}else{video.pause(); isPlaying=false;} updatePlayBtn(); });
video.addEventListener('play', ()=>{ isPlaying=true; updatePlayBtn(); });
video.addEventListener('pause', ()=>{ isPlaying=false; updatePlayBtn(); });
function updatePlayBtn(){ playBtn.textContent=isPlaying?'pause':'play_arrow'; }

// Fullscreen
fsBtn.addEventListener('click', async ()=>{ if(!document.fullscreenElement) await video.parentElement.requestFullscreen(); else await document.exitFullscreen(); });

// PIP
pipBtn.addEventListener('click', async ()=>{ if(document.pictureInPictureElement) await document.exitPictureInPicture(); else await video.requestPictureInPicture(); });

// Like / Dislike / Save
likeBtn.addEventListener('click', ()=>{ likeBtn.classList.toggle('text-red-500'); dislikeBtn.classList.remove('text-blue-500'); });
dislikeBtn.addEventListener('click', ()=>{ dislikeBtn.classList.toggle('text-blue-500'); likeBtn.classList.remove('text-red-500'); });
saveBtn.addEventListener('click', ()=>{ saveBtn.classList.toggle('text-yellow-500'); });

// Mid-roll sponsor display
video.addEventListener('timeupdate', ()=>{
  if(!adShown && video.currentTime > video.duration/3){
    adShown=true;
    sponsorImg.src=sponsorAd.img;
    sponsorLink.href=sponsorAd.url;
    sponsorAdDiv.classList.remove('hidden');
    video.pause();
  }
});
closeSponsor.addEventListener('click', ()=>{
  sponsorAdDiv.classList.add('hidden');
  video.play();
});

// Auto play
(async()=>{ try{ await video.play(); isPlaying=true; updatePlayBtn(); }catch(e){} })();