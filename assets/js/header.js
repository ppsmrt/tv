import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
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
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch(console.error);

function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const path = window.location.pathname;
  let page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  function formatTitle(filename) {
    if (filename === 'index.html') return 'Home';
    return filename.replace('.html','').replace(/[-_]/g,' ')
      .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const title = formatTitle(page);

  // Enhanced button styles
  let rightIconHTML = '';
  if (page === 'index.html') {
    rightIconHTML = `
      <button id="notificationBtn" style="
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        border: none;
        cursor: pointer;
        transition: background 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span class="material-icons" style="font-size:24px;">notifications</span>
        <span id="notifBadge" style="
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 50%;
          display: none;
          box-shadow: 0 1px 4px rgba(0,0,0,0.6);
        ">0</span>
      </button>
    `;
  } else {
    rightIconHTML = `
      <button id="backBtn" style="
        display:flex;
        align-items:center;
        gap:4px;
        padding: 8px 12px;
        border-radius: 10px;
        background: rgba(255,255,255,0.1);
        color:white;
        font-weight:500;
        border:none;
        cursor:pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      ">
        <span class="material-icons">arrow_back</span> Back
      </button>
    `;
  }

  headerContainer.innerHTML = `
    <header style="
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      background: linear-gradient(90deg, #1f2937, #111827);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 20;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
    ">
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="material-icons" style="
          font-size:28px;
          color: #f87171;
          background: rgba(255,255,255,0.1);
          padding:6px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        ">live_tv</span>
        <h1 style="
          margin:0;
          font-size:1.25rem;
          font-weight:700;
          color:#fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        ">${title}</h1>
      </div>
      <div>
        ${rightIconHTML}
      </div>
    </header>
  `;

  if (page === 'index.html') {
    const notifBtn = document.getElementById('notificationBtn');
    const notifBadge = document.getElementById('notifBadge');

    if (notifBtn) notifBtn.addEventListener('click', () => window.location.href = 'notifications.html');

    const ONE_DAY = 24 * 60 * 60 * 1000;
    let channelCount = 0;
    let notifCount = 0;

    function updateBadgeDisplay() {
      const total = channelCount + notifCount;
      if (notifBadge) {
        if (total > 0) {
          notifBadge.textContent = total;
          notifBadge.style.display = 'inline';
          notifBadge.animate([
            { transform: 'scale(1.2)', opacity: 0.8 },
            { transform: 'scale(1)', opacity: 1 }
          ], { duration: 300, easing: 'ease-out' });
        } else {
          notifBadge.style.display = 'none';
        }
      }
    }

    onValue(ref(db, 'channels'), snapshot => {
      const data = snapshot.val() || {};
      channelCount = Object.values(data).filter(c => {
        const ts = typeof c.createdAt === 'number' ? c.createdAt : new Date(c.createdAt).getTime();
        return Date.now() - ts < ONE_DAY;
      }).length;
      updateBadgeDisplay();
    });

    onValue(ref(db, 'notifications'), snapshot => {
      const data = snapshot.val() || {};
      notifCount = Object.values(data).filter(n => {
        const ts = n.timestamp || 0;
        return Date.now() - ts < ONE_DAY;
      }).length;
      updateBadgeDisplay();
    });

  } else {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.history.back());
  }
}

document.addEventListener("DOMContentLoaded", loadHeader);