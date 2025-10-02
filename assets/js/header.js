// header.js
(function () {
  const style = document.createElement("style");
  style.textContent = `
    /* Header */
    #header {
      background: #1E1E1E;
      color: white;
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
    }
    #header .header-bar {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #header .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      position: relative;
    }
    #header .title {
      font-weight: 600;
      font-size: 1.125rem;
    }

    /* Notification badge (red with white text) */
    .notif-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #dc2626; /* red-600 */
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      min-height: 18px;
    }

    /* Side Drawer */
    .side-drawer { position: fixed; top: 0; left: -240px; width: 240px; height: 100%; background: #1E1E1E; padding: 1rem; transition: left 0.3s ease; display: flex; flex-direction: column; gap: 1rem; z-index: 100; }
    .side-drawer.open { left: 0; }
    .drawer-item { display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#fff; cursor:pointer; padding:0.5rem; border-radius:0.5rem; transition:background 0.2s; text-decoration:none; }
    .drawer-item:hover { background:#2C2C2C; }
    .drawer-footer { margin-top:auto; display:flex; justify-content:space-around; padding-top:1rem; border-top:1px solid #333; }
    .drawer-footer a { color:#fff; font-size:1.5rem; transition: color 0.2s; }
    .drawer-footer a:hover { color: #1DB954; }

    /* Search Container */
    #searchContainer { width: 100%; background: #1E1E1E; padding: 0.5rem; display: none; }
    #searchContainer input { width: 100%; padding:0.5rem 0.75rem; border-radius:0.5rem; background: #2C2C2C; color:white; border:none; outline:none; }
  `;
  document.head.appendChild(style);

  const header = document.getElementById("header");
  if (header) {
    header.innerHTML = `
      <!-- Side Drawer -->
      <div class="side-drawer" id="sideDrawer">
        <a href="/" class="drawer-item"><span class="material-symbols-outlined">home</span> Home</a>
        <a href="applications" class="drawer-item"><span class="material-symbols-outlined">android</span> IPTV Applications</a>
        <a href="playlist" class="drawer-item"><span class="material-symbols-outlined">play_circle</span> Playlist</a>
        <a href="download" class="drawer-item"><span class="material-symbols-outlined">download</span> Download</a>
        <a href="about" class="drawer-item"><span class="material-symbols-outlined">info</span> About</a>
        <a href="signin" class="drawer-item"><span class="material-symbols-outlined">person</span> Profile</a>

        <!-- Drawer Footer with Social Icons -->
        <div class="drawer-footer">
          <a href="https://wa.me/1234567890" target="_blank" title="WhatsApp"><span class="material-symbols-outlined">chat</span></a>
          <a href="https://discord.com/invite/yourinvite" target="_blank" title="Discord"><span class="material-symbols-outlined">groups</span></a>
          <a href="mailto:tnm3us@gmail.com" title="Email"><span class="material-symbols-outlined">mail</span></a>
        </div>
      </div>

      <!-- Header Bar -->
      <div class="header-bar">
        <div class="flex items-center">
          <div class="icon-btn mr-3" id="menuBtn"><span class="material-symbols-outlined">menu</span></div>
          <div class="title">Live TV</div>
        </div>
        <div class="flex items-center relative">
          <div class="icon-btn" id="searchBtn"><span class="material-symbols-outlined">search</span></div>
          <div class="icon-btn ml-4" id="notifBtn">
            <span class="material-symbols-outlined">notifications</span>
            <span class="notif-badge" id="notifCount" style="display:none;">0</span>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div id="searchContainer"><input type="text" id="searchInput" placeholder="Search channels..." /></div>
    `;

    // Side Drawer toggle
    const menuBtn = document.getElementById("menuBtn");
    const sideDrawer = document.getElementById("sideDrawer");
    menuBtn.addEventListener("click", e => {
      e.stopPropagation();
      sideDrawer.classList.toggle("open");
    });
    document.addEventListener("click", e => {
      if (!sideDrawer.contains(e.target) && !menuBtn.contains(e.target)) sideDrawer.classList.remove("open");
    });

    // Search toggle
    const searchBtn = document.getElementById("searchBtn");
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");
    searchBtn.addEventListener("click", e => {
      e.stopPropagation();
      searchContainer.style.display = (searchContainer.style.display === "block") ? "none" : "block";
      searchInput.focus();
    });

    // Live search filter
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll(".channel-item").forEach(channel => {
        channel.style.display = channel.textContent.toLowerCase().includes(query) ? "" : "none";
      });
    });
    document.addEventListener("click", e => {
      if (!searchContainer.contains(e.target) && !searchBtn.contains(e.target)) searchContainer.style.display = "none";
    });

    // Notification logic
    const notifCountEl = document.getElementById("notifCount");
    const notifBtn = document.getElementById("notifBtn");

    const ONE_DAY = 24 * 60 * 60 * 1000;
    function updateNotificationCount(channels) {
      const now = Date.now();
      const recentCount = channels.filter(c => c.createdAt && (now - new Date(c.createdAt).getTime()) < ONE_DAY).length;
      if (recentCount > 0) {
        notifCountEl.style.display = "flex";
        notifCountEl.textContent = recentCount;
      } else {
        notifCountEl.style.display = "none";
      }
    }

    // Fetch channels from Firebase
    const db = firebase.database().ref("channels");
    db.on("value", snap => {
      const channels = [];
      snap.forEach(s => {
        const ch = s.val();
        // Ensure createdAt exists
        if (!ch.createdAt) {
          ch.createdAt = new Date().toISOString();
        }
        channels.push(ch);
      });
      updateNotificationCount(channels);
    });

    // Click notification icon → go to notifications page
    notifBtn.addEventListener("click", () => {
      window.location.href = "notifications.html";
    });
  }
})();
