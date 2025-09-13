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

  let leftIconsHTML = '';
  let rightIconHTML = '';

  if (page === 'index.html') {
    // Home page → TV icon
    leftIconsHTML = `<span class="material-icons" style="color:white; font-size:28px; margin-right:8px;">live_tv</span>`;
    
    // Notification bell
    rightIconHTML = `
      <button id="notificationBtn" style="width:40px;height:40px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
        <span class="material-icons" style="font-size:28px;color:white;animation:ring 1.5s infinite;">notifications</span>
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
      </style>
    `;
  } else {
    // Non-home pages → Chevron-left + Sign In/Out icons
    const signedIn = localStorage.getItem('signedIn') === 'true';
    const authIcon = signedIn ? 'logout' : 'login';

    leftIconsHTML = `
      <button id="chevronBack" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:none;background:none;color:white;cursor:pointer;font-size:28px;margin-right:8px;">
        <span class="material-icons">chevron_left</span>
      </button>

      <button id="authBtn" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:none;background:none;color:white;cursor:pointer;font-size:28px;">
        <span class="material-icons">${authIcon}</span>
      </button>
    `;

    rightIconHTML = '';
  }

  headerContainer.innerHTML = `
    <header style="
      height:64px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:0 1.5rem;
      background: rgba(31,41,55,0.85);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position:fixed;
      top:0;
      left:0;
      right:0;
      border-bottom-left-radius:12px;
      border-bottom-right-radius:12px;
      z-index:20;
    ">
      <div style="display:flex;align-items:center;">
        ${leftIconsHTML}
        <h1 style="font-size:1.25rem;font-weight:600;color:white;margin-left:8px;">${title}</h1>
      </div>
      <div>
        ${rightIconHTML}
      </div>
    </header>
  `;

  // Event listeners
  if (page === 'index.html') {
    const notifBtn = document.getElementById('notificationBtn');
    notifBtn?.addEventListener('click', () => window.location.href='notifications.html');
  } else {
    // Chevron back
    const chevronBack = document.getElementById('chevronBack');
    chevronBack?.addEventListener('click', () => window.history.back());

    // Sign In / Sign Out toggle
    const authBtn = document.getElementById('authBtn');
    authBtn?.addEventListener('click', () => {
      const signedInNow = localStorage.getItem('signedIn') === 'true';
      if (signedInNow) {
        // Sign out
        localStorage.setItem('signedIn', 'false');
        authBtn.querySelector('span').textContent = 'login';
      } else {
        // Go to signin page
        window.location.href = 'signin.html';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadHeader);