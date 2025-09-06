// header.js
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const db = getDatabase();

export function injectHeader() {
  // Ensure DOM is ready
  document.addEventListener("DOMContentLoaded", () => {

    // Get page name (extensionless)
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const pageName = pathParts.length ? pathParts.pop().toLowerCase() : "index";

    // Title formatting
    const formatTitle = (name) => {
      switch (name) {
        case "index": return "Home";
        case "signin": return "Sign In";
        case "signup": return "Sign Up";
        case "player": return "Live Player";
        case "dashboard": return "Dashboard";
        default: 
          return name.replace(/[-_]/g, " ")
                     .split(" ")
                     .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                     .join(" ");
      }
    };

    // Icon pick
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

    // Get header container
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    // Header element
    const header = document.createElement("header");
    header.className = "flex items-center justify-between p-3 bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50";

    // Left icon
    const leftIcon = document.createElement("span");
    leftIcon.className = "material-icons cursor-pointer text-2xl";
    leftIcon.textContent = pageName === "index" ? "live_tv" : "arrow_back";
    leftIcon.onclick = () => pageName === "index" ? window.location.href = "/" : window.history.back();

    // Title container
    const titleContainer = document.createElement("div");
    titleContainer.className = "flex items-center flex-1 truncate ml-2";

    const pageIcon = document.createElement("span");
    pageIcon.className = "material-icons text-base mr-1";
    pageIcon.textContent = pickIcon(pageName);
    titleContainer.appendChild(pageIcon);

    const title = document.createElement("h1");
    title.className = "text-lg font-bold truncate text-white";
    title.textContent = formatTitle(pageName);
    titleContainer.appendChild(title);

    // Right icon (notifications for home/index)
    let rightIcon, notifBadge;
    if (pageName === "index") {
      rightIcon = document.createElement("span");
      rightIcon.className = "material-icons cursor-pointer text-2xl relative";
      rightIcon.textContent = "notifications";
      rightIcon.onclick = () => window.location.href = "/notifications";

      notifBadge = document.createElement("span");
      notifBadge.className = "absolute top-0 right-0 w-4 h-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center";
      notifBadge.style.fontSize = "10px";
      notifBadge.style.display = "none";
      rightIcon.appendChild(notifBadge);
    }

    header.appendChild(leftIcon);
    header.appendChild(titleContainer);
    if (rightIcon) header.appendChild(rightIcon);

    headerContainer.innerHTML = "";
    headerContainer.appendChild(header);

    // Player page dynamic title
    if (pageName === "player") {
      const channelName = document.getElementById("channelName")?.textContent?.trim();
      if (channelName) title.textContent = channelName;
    }

    // Firebase notifications for home
    if (pageName === "index" && notifBadge) {
      const notifRef = ref(db, "notifications");
      onValue(notifRef, (snapshot) => {
        const notifications = snapshot.val() || {};
        const count = Object.keys(notifications).length;
        notifBadge.style.display = count > 0 ? "flex" : "none";
        if (count > 0) notifBadge.textContent = count;
      });
    }

    // Pull-to-refresh (mobile)
    let startY = 0;
    let isRefreshing = false;

    const refreshCircle = document.createElement("div");
    refreshCircle.className = "w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full absolute top-3 left-1/2 -translate-x-1/2 -translate-y-10 opacity-0 transition-all";
    header.appendChild(refreshCircle);

    document.addEventListener("touchstart", (e) => {
      if (window.scrollY === 0) startY = e.touches[0].clientY;
    });

    document.addEventListener("touchmove", (e) => {
      const diff = e.touches[0].clientY - startY;
      if (diff > 50 && !isRefreshing && window.scrollY === 0) {
        isRefreshing = true;
        refreshCircle.style.opacity = "1";
        refreshCircle.style.animation = "spin 1s linear infinite";

        setTimeout(() => {
          refreshCircle.style.transition = "opacity 0.5s ease";
          refreshCircle.style.opacity = "0";
          setTimeout(() => window.location.reload(), 500);
        }, 1000);
      }
    });

    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: translateX(-50%) translateY(-10px) rotate(0deg);}
        100% { transform: translateX(-50%) translateY(-10px) rotate(360deg);}
      }
    `;
    document.head.appendChild(style);

  });
}

// Auto-inject header when imported as module
injectHeader();
