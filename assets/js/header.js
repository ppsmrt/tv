function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const path = window.location.pathname;
  let page = path.substring(path.lastIndexOf('/') + 1);
  if (!page) page = 'index.html'; // handle root URL

  function formatTitle(filename) {
    if (filename === 'index.html') return 'Home';
    let name = filename.replace('.html','');
    name = name.replace(/[-_]/g,' ');
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const title = formatTitle(page);

  let rightIconHTML = '';

  if (page === 'index.html') {
    // Home page → Animated notification bell
    rightIconHTML = `
      <button id="notificationBtn" style="
        position: relative;
        background:none;
        border:none;
        cursor:pointer;
        outline:none;
        display:flex;
        align-items:center;
        justify-content:center;
        width:40px;
        height:40px;
        border-radius:50%;
        transition: transform 0.2s;
      ">
        <span class="material-icons bell-icon" style="
          font-size:28px;
          color:white;
          animation: ring 1.5s infinite;
        ">notifications</span>
      </button>

      <style>
        @keyframes ring {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(15deg); }
          100% { transform: rotate(0deg); }
        }
        #notificationBtn:hover {
          transform: scale(1.2);
        }
      </style>
    `;
  } else {
    // Other pages → Back button with icon
    rightIconHTML = `
      <button id="backBtn" style="
        display:flex;
        align-items:center;
        color:white;
        background:none;
        border:none;
        font-size:16px;
        cursor:pointer;
        font-weight:500;
        transition: transform 0.2s;
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
      background: rgba(31,41,55,0.85);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 20;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    ">
      <div style="display:flex; align-items:center;">
        <span class="material-icons" style="
          color:white;
          font-size:28px;
          margin-right:8px;
        ">live_tv</span>
        <h1 style="
          font-size:1.25rem;
          font-weight:600;
          color:white;
        ">${title}</h1>
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