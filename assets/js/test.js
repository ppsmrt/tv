import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase Setup
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

// Elements
const video = document.getElementById('video');
const videoTitle = document.getElementById('videoTitle');
const videoDesc = document.getElementById('videoDesc');
const relatedContainer = document.getElementById('relatedChannels');

// Shaka Player Setup
shaka.polyfill.installAll();
const player = new shaka.Player(video);
const ui = new shaka.ui.Overlay(player, document.getElementById('videoContainer'), video);
ui.configure({ controlPanelElements: ['play_pause', 'mute', 'volume', 'fullscreen', 'time_and_duration', 'seek_bar'] });
player.configure({ streaming: { lowLatencyMode:true, rebufferingGoal:2, bufferingGoal:5 } });

// Fetch selected stream from URL
const urlParams = new URLSearchParams(window.location.search);
let streamSlug = urlParams.get('stream');
if (streamSlug) streamSlug = streamSlug.replace(/-/g,' ').toLowerCase();

// Load video info from Firebase
get(ref(db,'channels')).then(snapshot => {
  if (!snapshot.exists()) return;
  let selected = null;
  snapshot.forEach(child => {
    const data = child.val();
    const nameSlug = data.name?.toLowerCase();
    if (nameSlug === streamSlug) selected = data;

    // Add to related channels
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${data.thumb || 'https://via.placeholder.com/150'}"/><p class="p-1 text-sm text-white">${data.name}</p>`;
    card.onclick = () => {
      loadStream(data);
    };
    relatedContainer.appendChild(card);
  });
  if(selected) loadStream(selected);
}).catch(console.error);

// Function to load stream
function loadStream(data) {
  videoTitle.textContent = data.name || 'Live Stream';
  videoDesc.textContent = data.desc || 'No description available.';
  player.load(data.stream).then(()=>video.play().catch(()=>{}));
}

// Favorites (localStorage)
let favorites = JSON.parse(localStorage.getItem('favorites'))||[];
function addToFav(data){
  if(!favorites.some(f=>f.src===data.stream)) {
    favorites.push({title:data.name, src:data.stream});
    localStorage.setItem('favorites',JSON.stringify(favorites));
  }
}
function removeFromFav(data){
  favorites = favorites.filter(f=>f.src!==data.stream);
  localStorage.setItem('favorites',JSON.stringify(favorites));
}

// Optional: Add scroll/tap to hide/show controls handled by Shaka UI itself