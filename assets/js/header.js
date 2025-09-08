function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  // Get current page name
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);

  let rightIconHTML = '';

  if (page === '' || page === 'index.html') {
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
        <h1 style="margin-left:8px; font-size:1.125rem; font-weight:bold; color:white;">Live TV</h1>
      </div>
      <div>
        ${rightIconHTML}
      </div>
    </header>
  `;

  // Add event listeners
  if (page === '' || page === 'index.html') {
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
