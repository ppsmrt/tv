// header.js

// --- Firebase setup ---
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db = getDatabase();

// Page configuration
const pageConfig = {
  'index.html': { leftIcon: 'live_tv', title: 'TamilGeo Live', rightIcon: 'notifications', rightAction: () => window.location.href = 'notifications.html' },
  'playlist.html': { leftIcon: 'arrow_back', title: 'Playlist', pageIcon: 'queue_music' },
  'notifications.html': { leftIcon: 'arrow_back', title: 'Notifications', pageIcon: 'notifications' },
  'dashboard.html': { leftIcon: 'arrow_back', title: 'Dashboard', pageIcon: 'dashboard' },
  'iptv-applications.html': { leftIcon: 'arrow_back', title: 'Applications', pageIcon: 'apps' },
  'player.html': { leftIcon: 'arrow_back', title: '', pageIcon: 'live_tv', dynamicChannelName: true }
};

// Detect current page
const path = window.location.pathname.split("/").pop() || 'index.html';
const config = pageConfig[path] || { leftIcon: 'arrow_back', title: 'Page' };

// Container
const app = document.getElementById('app') || document.body;

// Create header
const header = document.createElement('header');
header.className = 'flex items-center justify-between p-3 bg-white shadow-md fixed top-0 left-0 right-0 z-50';

// Left icon
const leftIcon = document.createElement('span');
leftIcon.className = 'material-icons cursor-pointer text-2xl';
leftIcon.textContent = config.leftIcon;
if (config.leftIcon === 'arrow_back') {
  leftIcon.onclick = () => window.history.back();
} else if (config.leftIcon === 'live_tv') {
  leftIcon.onclick = () => window.location.href = 'index.html';
}

// Title container
const titleContainer = document.createElement('div');
titleContainer.className = 'flex items-center flex-1 truncate ml-2';
if (config.pageIcon) {
  const pageIcon = document.createElement('span');
  pageIcon.className = 'material-icons text-base mr-1';
  pageIcon.textContent = config.pageIcon;
  titleContainer.appendChild(pageIcon);
}
const title = document.createElement('h1');
title.className = 'text-lg font-bold truncate';
title.textContent = config.title;
titleContainer.appendChild(title);

// Right icon
let rightIcon, notifBadge;
if (config.rightIcon) {
  rightIcon = document.createElement('span');
  rightIcon.className = 'material-icons cursor-pointer text-2xl relative';
  rightIcon.textContent = config.rightIcon;
  rightIcon.onclick = config.rightAction;

  // Red notification badge
  notifBadge = document.createElement('span');
  notifBadge.className = 'absolute top-0 right-0 w-4 h-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center';
  notifBadge.style.fontSize = '10px';
  notifBadge.style.display = 'none'; // hide by default
  rightIcon.appendChild(notifBadge);
}

// Append to header
header.appendChild(leftIcon);
header.appendChild(titleContainer);
if (rightIcon) header.appendChild(rightIcon);
app.prepend(header);

// Player page dynamic channel name
if (config.dynamicChannelName) {
  const channelName = document.getElementById('channelName')?.textContent || 'Live Channel';
  title.textContent = channelName;
}

// --- Pull-to-refresh ---
let startY = 0;
let isRefreshing = false;
const refreshCircle = document.createElement('div');
refreshCircle.className = 'w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full absolute top-3 left-1/2 -translate-x-1/2 -translate-y-10 opacity-0 transition-opacity';
header.appendChild(refreshCircle);

document.addEventListener('touchstart', (e) => {
  if (window.scrollY === 0) startY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
  const diff = e.touches[0].clientY - startY;
  if (diff > 50 && !isRefreshing && window.scrollY === 0) {
    isRefreshing = true;
    refreshCircle.style.opacity = '1';
    refreshCircle.style.animation = 'spin 1s linear infinite';
    window.location.reload();
  }
});

const style = document.createElement('style');
style.textContent = `
@keyframes spin {
  0% { transform: translateX(-50%) translateY(-10px) rotate(0deg);}
  100% { transform: translateX(-50%) translateY(-10px) rotate(360deg);}
}`;
document.head.appendChild(style);

// --- Firebase: live notifications count for home page ---
if (path === 'index.html' && notifBadge) {
  const notifRef = ref(db, 'notifications'); // adjust path based on your DB structure
  onValue(notifRef, (snapshot) => {
    const notifications = snapshot.val() || {};
    const count = Object.keys(notifications).length;
    if (count > 0) {
      notifBadge.style.display = 'flex';
      notifBadge.textContent = count;
    } else {
      notifBadge.style.display = 'none';
    }
  });
}
