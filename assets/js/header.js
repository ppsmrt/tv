function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const path = window.location.pathname;
  let page = path.substring(path.lastIndexOf('/') + 1);
  if (!page) page = 'index.html'; // handle root URL

  // Convert filename to readable title
  function formatTitle(filename) {
    if (filename === 'index.html') return 'Home';
    let name = filename.replace('.html','');      // remove extension
    name = name.replace(/[-_]/g,' ');            // replace dashes/underscores
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const title = formatTitle(page);

  let rightIconHTML = '';

  if (page === 'index.html') {
    // Home page → Notifications icon
    rightIconHTML = `
      <button id="notificationBtn" style="
        color:white;
        background:none;
        border:none;
        font-size:24px;
        cursor:pointer;
      ">
        <span class="material-icons">notifications</span>
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

  // Event listeners
  if (page === 'index.html') {
    const notifBtn = document.getElementById('notificationBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        window.location.href = 'notifications.html';
      });
    }
  } else {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", loadHeader);
