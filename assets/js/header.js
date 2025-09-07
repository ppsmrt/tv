// header.js

function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

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
        <button id="logoutBtn" style="
          color:white; 
          background:none; 
          border:none; 
          font-size:16px; 
          cursor:pointer;
        ">Logout</button>
      </div>
    </header>
  `;
}

document.addEventListener("DOMContentLoaded", loadHeader);
