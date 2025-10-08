// footer.js
(function () {
  // Styles
  const style = document.createElement("style");
  style.textContent = `
    #footer {
      text-align: center;
      padding: 0.75rem;
      background: #1E1E1E;
      border-top: 1px solid #374151;
      color: #9CA3AF;
      font-size: 0.9rem;
      transition: color 0.3s ease;
      cursor: default;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      align-items: center;
    }
    #footer:hover { color: #FFD700; }
    #visitorCounter {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #9CA3AF;
    }
    #visitorCounter span.material-symbols-outlined {
      color: #FFD700;
      font-size: 1rem;
    }
  `;
  document.head.appendChild(style);

  // Footer content
  const footer = document.getElementById("footer");
  if (footer) {
    const currentYear = new Date().getFullYear();
    footer.innerHTML = `
      ©️ ${currentYear} Live TV · Innovation in Entertainment.
      <div id="visitorCounter">
        <span class="material-symbols-outlined">visibility</span>
        <span id="visitorCount">Loading...</span>
      </div>
    `;
  }

  const countEl = document.getElementById('visitorCount');

  // CountAPI usage
  fetch("https://api.countapi.xyz/hit/tnm3u.live/visits")
    .then(res => res.json())
    .then(data => {
      if (countEl) countEl.textContent = data.value.toLocaleString();
    })
    .catch(err => {
      console.error("CountAPI error:", err);
      if (countEl) countEl.textContent = "N/A";
    });
})();
