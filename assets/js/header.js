function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const path = window.location.pathname;
  let page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  function formatTitle(filename) {
    if (filename === 'index.html') return 'Home';
    let name = filename.replace('.html','').replace(/[-_]/g,' ');
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const title = formatTitle(page);

  let leftHTML = '';
  let rightHTML = '';

  if (page === 'index.html') {
    // Home page → TV icon + notification bell
    leftHTML = `<span class="material-icons" style="color:white;font-size:32px;margin-right:12px;">live_tv</span>
                <h1 style="font-size:1.5rem;font-weight:700;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.5);">TamilGeo</h1>`;
    rightHTML = `
      <button id="notificationBtn" style="position:relative;background:none;border:none;cursor:pointer;outline:none;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:transform 0.2s;">
        <span class="material-icons" style="font-size:28px;color:white;animation:ring 1.5s infinite;">notifications</span>
      </button>
      <style>
        @keyframes ring {
          0%{transform:rotate(0deg);}15%{transform:rotate(15deg);}30%{transform:rotate(-10deg);}
          45%{transform:rotate(15deg);}60%{transform:rotate(-10deg);}75%{transform:rotate(15deg);}100%{transform:rotate(0deg);}
        }
        #notificationBtn:hover{transform:scale(1.2);}
      </style>
    `;
  } else {
    // Non-home pages → Chevron-left + title (left), Sign In / Sign Out (right)
    leftHTML = `
      <button id="chevronBack" style="display:flex;align-items:center;color:white;background:none;border:none;font-size:28px;cursor:pointer;margin-right:12px;transition:transform 0.2s;">
        <span class="material-icons">chevron_left</span>
      </button>
      <h1 style="font-size:1.5rem;font-weight:700;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${title}</h1>
    `;

    const signedIn = localStorage.getItem('signedIn') === 'true';
    rightHTML = `
      <button id="authBtn" style="
        display:flex;align-items:center;gap:6px;color:${signedIn ? 'red' : 'white'};background:none;border:none;font-size:16px;font-weight:600;cursor:pointer;padding:6px 10px;border-radius:8px;transition:all 0.2s;">
        <span class="material-icons">${signedIn ? 'logout' : 'login'}</span>
        <span>${signedIn ? 'Sign Out' : 'Sign In'}</span>
      </button>
    `;
  }

  headerContainer.innerHTML = `
    <header style="
      height:70px; display:flex;align-items:center;justify-content:space-between;
      padding:0 1.5rem; background:rgba(31,41,55,0.85); backdrop-filter:blur(12px);
      box-shadow:0 8px 20px rgba(0,0,0,0.4); border-bottom-left-radius:14px; border-bottom-right-radius:14px;
      position:fixed;top:0;left:0;right:0;z-index:50;
    ">
      <div style="display:flex;align-items:center;">${leftHTML}</div>
      <div style="display:flex;align-items:center;">${rightHTML}</div>
    </header>
  `;

  // Event listeners
  if (page === '/') {
    document.getElementById('notificationBtn')?.addEventListener('click', () => window.location.href='notifications.html');
  } else {
    document.getElementById('chevronBack')?.addEventListener('click', () => window.history.back());

    const authBtn = document.getElementById('authBtn');
    authBtn?.addEventListener('click', () => {
      const signedInNow = localStorage.getItem('signedIn') === 'true';
      if (signedInNow) {
        localStorage.setItem('signedIn', 'false');
        authBtn.querySelector('span:first-child').textContent = 'login';
        authBtn.querySelector('span:last-child').textContent = 'Sign In';
        authBtn.style.color = 'white';
      } else {
        window.location.href = 'signin.html';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadHeader);