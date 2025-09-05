// player.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJoxttxIrGMSYU-ROjrYng2swbB0owOoA",
  authDomain: "tamilgeo-d10d6.firebaseapp.com",
  databaseURL: "https://tamilgeo-d10d6-default-rtdb.firebaseio.com",
  projectId: "tamilgeo-d10d6",
  storageBucket: "tamilgeo-d10d6.firebasestorage.app",
  messagingSenderId: "789895210550",
  appId: "1:789895210550:android:63f757c9cac09581275a97"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const video = document.getElementById("video");
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoTitle = document.getElementById("videoTitle");

// Get stream param
const params = new URLSearchParams(window.location.search);
const streamName = params.get("stream");

// Fetch channel from Firebase
const channelsRef = ref(db, "channels");
onValue(channelsRef, snapshot => {
  if(snapshot.exists()){
    const data = snapshot.val();
    const channels = Object.values(data);
    const channel = channels.find(c => encodeURIComponent(c.name.toLowerCase().replace(/\s+/g,'-')) === streamName);

    if(channel){
      videoTitle.textContent = channel.name;
      const streamURL = channel.stream;

      // HLS setup
      if(Hls.isSupported()){
        const hls = new Hls();
        hls.loadSource(streamURL);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      } else if(video.canPlayType("application/vnd.apple.mpegurl")){
        video.src = streamURL;
        video.addEventListener("loadedmetadata", () => video.play());
      }
    } else {
      videoTitle.textContent = "Channel not found";
    }
  }
});

// Controls
playBtn.addEventListener("click", () => {
  if(video.paused){ video.play(); playBtn.textContent="pause"; }
  else { video.pause(); playBtn.textContent="play_arrow"; }
});

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? "volume_off" : "volume_up";
});

volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value;
  video.muted = e.target.value==0;
  muteBtn.textContent = video.muted ? "volume_off" : "volume_up";
});

fullscreenBtn.addEventListener("click", () => {
  if(!document.fullscreenElement){
    video.requestFullscreen().catch(err=>console.log(err));
  } else {
    document.exitFullscreen();
  }
});

// Optional: hide controls on idle
let mouseTimer;
video.parentElement.addEventListener("mousemove", () => {
  const controls = document.getElementById("controls");
  controls.classList.remove("hidden");
  clearTimeout(mouseTimer);
  mouseTimer = setTimeout(()=>controls.classList.add("hidden"), 4000);
});