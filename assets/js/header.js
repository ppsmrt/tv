import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const path = window.location.pathname;
  let page = path.substring(path.lastIndexOf('/') + 1);
  if (!page) page = 'index.html';

  function formatTitle(filename) {
    if (filename === 'index.html') return 'Home';
    let name = filename.replace('.html','').replace(/[-_]/g,' ');
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const title = formatTitle(page);

  let rightIconHTML = '';

  if (page === 'index.html') {
    // Home page → Notifications icon with badge
    rightIconHTML = `
      <button id="notificationBtn" style="
        position: relative;
        color:white;
        background:none;
        border:none;
        font-size:24px;
        cursor:pointer;
      ">
        <span class="material-icons">notifications</span>
        <span id="notifBadge" style="
          position: absolute;
          top: -4px;
          right: -4px;
          background: #f87171;
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 50%;
          display: none;
        ">0</span>
      </button>
    `;
  } else {
    // Other pages → Back button
    rightIconHTML = `
      <button id="backBtn" style="
        display:flex;
        align-items:center;
        color:white;
        background:none;
        border:none;
        font-size:16px;
        cursor:pointer;
      ">
        <span class="material-icons" style="margin-right:4px;">arrow_back</span> Back
      </button>
    `;
  }

  headerContainer.innerHTML = `
    <header style="
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      background: rgba(31,41,55,0.9);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      z-index: 20;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
    ">
      <div style="display:flex; align-items:center;">
        <span class="material-icons" style="color:white;">live_tv</span>
        <h1 style="margin-left:8px; font-size:1.125rem; font-weight:bold; color:white;">${title}</h1>
      </div>
      <div>
        ${rightIconHTML}
      </div>
    </header>
  `;

  if (page === 'index.html') {
    const notifBtn = document.getElementById('notificationBtn');
    const notifBadge = document.getElementById('notifBadge');

    // Navigate to notifications page
    if (notifBtn) {
      notifBtn.addEventListener('click', () => window.location.href = 'notifications.html');
    }

    // Count notifications from last 24 hours
    const ONE_DAY = 24 * 60 * 60 * 1000;

    function updateNotificationBadge() {
      let newCount = 0;

      onValue(ref(db, 'channels'), snapshot => {
        const data = snapshot.val() || {};
        newCount += Object.values(data).filter(c => {
          const ts = c.createdAt ? new Date(c.createdAt).getTime() : 0;
          return Date.now() - ts < ONE_DAY;
        }).length;

        updateBadgeDisplay();
      });

      onValue(ref(db, 'notifications'), snapshot => {
        const data = snapshot.val() || {};
        newCount += Object.values(data).filter(n => {
          const ts = n.timestamp || 0;
          return Date.now() - ts < ONE_DAY;
        }).length;

        updateBadgeDisplay();
      });

      function updateBadgeDisplay() {
        if (notifBadge) {
          if (newCount > 0) {
            notifBadge.textContent = newCount;
            notifBadge.style.display = 'inline';
          } else {
            notifBadge.style.display = 'none';
          }
        }
      }
    }

    updateNotificationBadge();
  } else {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => window.history.back());
  }
}

document.addEventListener("DOMContentLoaded", loadHeader);