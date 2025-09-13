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

  let leftIconHTML = '';
  let rightIconHTML = '';

  if (page === 'index.html') {
    // Home page → TV icon stays
    leftIconHTML = `<span class="material-icons" style="color:white;font-size:28px;margin-right:8px;">live_tv</span>`;

    // Right: Notification bell
    rightIconHTML = `
      <button id="notificationBtn" style="position: relative;background:none;border:none;cursor:pointer;outline:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;transition: transform 0.2s;">
        <span class="material-icons bell-icon" style="font-size:28px;color:white;animation:ring 1.5s infinite;">notifications</span>
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
        #notificationBtn:hover { transform: scale(1.2); }
      </style>
    `;
  } else {
    // Non-home pages → Chevron-right + page title (left)
    leftIconHTML = `
      <button id="chevronBack" style="display:flex;align-items:center;color:white;background:none;border:none;font-size:28px;cursor:pointer;margin-right:8px;">
        <span class="material-icons">chevron_right</span>
      </button>
      <h1 style="font-size:1.25rem;font-weight:600;color:white;">${title}</h1>
    `;

    // Right: Sign In / Sign Out
    const signedIn = localStorage.getItem('signedIn') === 'true';
    rightIconHTML = `
      <button id="authBtn" style="display:flex;align-items:center;gap:4px;color:${signedIn ? 'red' : 'white'};background:none;border:none;font-size:16px;cursor:pointer;font-weight:500;">
        <span class="material-icons">${signedIn ? 'logout' : 'login'}</span>
        <span>${signedIn ? 'Sign Out' : 'Sign In'}</span>
      </button>
    `;
  }

  headerContainer.innerHTML = `
    <header style="height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;background:rgba(31,41,55,0.85);backdrop-filter:blur(10px);box-shadow:0 4px 12px rgba(0,0,0,0.3);border-bottom-left-radius:12px;border-bottom-right-radius:12px;position:fixed;top:0;left:0;right:0;z-index:20;">
      <div style="display:flex;align-items:center;">
        ${leftIconHTML}
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
        authBtn.querySelector('span:first-child').textContent = 'login';
        authBtn.querySelector('span:last-child').textContent = 'Sign In';
        authBtn.style.color = 'white';
      } else {
        // Go to signin page
        window.location.href = 'signin.html';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadHeader);