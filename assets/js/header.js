// --- Firebase setup ---
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const db = getDatabase();

// Detect current page
const path = window.location.pathname.split("/").pop() || 'index.html';
const pageName = path.replace(".html", "");

// Generate a human-friendly title
const formatTitle = (name) => {
  if (name === "index") return "Home";
  if (name === "signin") return "Sign In";
  if (name === "signup") return "Sign Up";
  if (name === "player") return "Live Player";

  return name
    .replace(/[-_]/g, " ")              // turn - and _ into spaces
    .split(" ")
    .map(word => {
      if (word.toLowerCase() === "iptv") return "IPTV"; // special case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// Pick an icon based on page name
const pickIcon = (name) => {
  switch (name) {
    case "index": return "live_tv";
    case "playlist": return "queue_music";
    case "notifications": return "notifications";
    case "dashboard": return "dashboard";
    case "iptv-applications": return "apps";
    case "player": return "live_tv";
    case "signin": return "login";
    case "signup": return "person_add";
    default: return "description";
  }
};

// Target the <div id="header">
const headerContainer = document.getElementById("header");

// Create header element
const header = document.createElement('header');
header.className = 'flex items-center justify-between p-3 bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50';

// Left icon
const leftIcon = document.createElement('span');
leftIcon.className = 'material-icons cursor-pointer text-2xl';
leftIcon.textContent = path === "index.html" ? "live_tv" : "arrow_back";
leftIcon.onclick = () => {
  if (path === "index.html") {
    window.location.href = "index.html";
  } else {
    window.history.back();
  }
};

// Title container
const titleContainer = document.createElement('div');
titleContainer.className = 'flex items-center flex-1 truncate ml-2';

const pageIcon = document.createElement('span');
pageIcon.className = 'material-icons text-base mr-1';
pageIcon.textContent = pickIcon(pageName);
titleContainer.appendChild(pageIcon);

const title = document.createElement('h1');
title.className = 'text-lg font-bold truncate';
title.textContent = formatTitle(pageName);
titleContainer.appendChild(title);

// Right icon (only on home/index)
let rightIcon, notifBadge;
if (path === "index.html") {
  rightIcon = document.createElement('span');
  rightIcon.className = 'material-icons cursor-pointer text-2xl relative';
  rightIcon.textContent = "notifications";
  rightIcon.onclick = () => window.location.href = 'notifications.html';

  notifBadge = document.createElement('span');
  notifBadge.className = 'absolute top-0 right-0 w-4 h-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center';
  notifBadge.style.fontSize = '10px';
  notifBadge.style.display = 'none';
  rightIcon.appendChild(notifBadge);
}

// Append children into header
header.appendChild(leftIcon);
header.appendChild(titleContainer);
if (rightIcon) header.appendChild(rightIcon);

// Inject header into container
headerContainer.innerHTML = "";
headerContainer.appendChild(header);

// --- Firebase notifications badge for home ---
if (path === "index.html" && notifBadge) {
  const notifRef = ref(db, 'notifications');
  onValue(notifRef, (snapshot) => {
    const notifications = snapshot.val() || {};
    const count = Object.keys(notifications).length;
    notifBadge.style.display = count > 0 ? 'flex' : 'none';
    if (count > 0) notifBadge.textContent = count;
  });
}