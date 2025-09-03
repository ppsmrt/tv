// Player.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// HLS.js import (for all non-Safari browsers)
import Hls from 'https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js';

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
    if(!match){ 
        channelTitle.textContent = 'Stream not found'; 
        video.src=''; 
        return; 
    }

    channelTitle.textContent = match.name;

    const streamUrl = match.url;

    // HLS support
    if(Hls.isSupported() && streamUrl.endsWith('.m3u8')){
        const hls = new Hls({
            enableWorker: true,
            // retry settings for HTTP errors
            xhrSetup: (xhr, url) => { xhr.timeout = 10000; },
            maxRetry: 6,
            fragLoadingTimeOut: 10000,
            fragLoadingMaxRetry: 6
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn('HLS.js error', data);
            if(data.fatal){
                switch(data.type){
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.warn("Fatal network error, trying to recover...");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.warn("Fatal media error, trying to recover...");
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error("Cannot recover", data);
                        break;
                }
            }
        });
    } else {
        // Native playback (Safari or TS fallback)
        video.src = streamUrl;
    }

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