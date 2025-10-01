// footer.js
(function () {
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
    }
    #footer:hover {
      color: #FFD700; /* subtle golden highlight */
    }
  `;
  document.head.appendChild(style);

  const footer = document.getElementById("footer");
  if (footer) {
    const currentYear = new Date().getFullYear();
    footer.innerHTML = `©️ ${currentYear} Live TV · Innovation in Entertainment.`;
  }
})();