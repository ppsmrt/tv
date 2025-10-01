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
    }
    #header .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
    }
    #header .title {
      font-weight: 600;
      font-size: 1.125rem;
    }

    /* Side Drawer */
    .side-drawer {
      position: fixed;
      top: 0;
      left: -240px;
      width: 240px;
      height: 100%;
      background: #1E1E1E;
      padding: 1rem;
      transition: left 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 100;
    }
    .side-drawer.open {
      left: 0;
    }
    .drawer-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      color: #fff;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: background 0.2s;
      text-decoration: none;
    }
    .drawer-item:hover {
      background: #2C2C2C;
    }
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
        <a href="signin" class="drawer-item"><span class="material-symbols-outlined">person</span> Profile</a>
      </div>

      <!-- Header Bar -->
      <div class="flex items-center">
        <div class="icon-btn mr-3" id="menuBtn">
          <span class="material-symbols-outlined">menu</span>
        </div>
        <div class="title">Live TV</div>
      </div>
      <div class="flex items-center relative">
        <div class="icon-btn" id="searchBtn">
          <span class="material-symbols-outlined">search</span>
        </div>
      </div>
    `;

    // Side Drawer toggle logic
    const menuBtn = document.getElementById("menuBtn");
    const sideDrawer = document.getElementById("sideDrawer");

    // Toggle drawer when menu button is clicked
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event from bubbling to document
      sideDrawer.classList.toggle("open");
    });

    // Close drawer when clicking outside
    document.addEventListener("click", (e) => {
      if (!sideDrawer.contains(e.target) && !menuBtn.contains(e.target)) {
        sideDrawer.classList.remove("open");
      }
    });
  }
})();