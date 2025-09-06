// header.js

// Mapping pages to their icons and titles
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

// Get container
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

// Title container (with optional page-specific icon)
const titleContainer = document.createElement('div');
titleContainer.className = 'flex items-center flex-1 truncate ml-2';

// Page-specific icon (material icon left of title)
if (config.pageIcon) {
  const pageIcon = document.createElement('span');
  pageIcon.className = 'material-icons text-base mr-1';
  pageIcon.textContent = config.pageIcon;
  titleContainer.appendChild(pageIcon);
}

// Title text
const title = document.createElement('h1');
title.className = 'text-lg font-bold truncate';
title.textContent = config.title;
titleContainer.appendChild(title);

// Right icon
let rightIcon;
if (config.rightIcon) {
  rightIcon = document.createElement('span');
  rightIcon.className = 'material-icons cursor-pointer text-2xl';
  rightIcon.textContent = config.rightIcon;
  rightIcon.onclick = config.rightAction;
}

// Append to header
header.appendChild(leftIcon);
header.appendChild(titleContainer);
if (rightIcon) header.appendChild(rightIcon);

// Inject header
app.prepend(header);

// Special case: player page shows channel name dynamically
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
    window.location.reload(); // simple refresh
  }
});

const style = document.createElement('style');
style.textContent = `
@keyframes spin {
  0% { transform: translateX(-50%) translateY(-10px) rotate(0deg);}
  100% { transform: translateX(-50%) translateY(-10px) rotate(360deg);}
}`;
document.head.appendChild(style);
