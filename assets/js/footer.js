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
    }
  `;
  document.head.appendChild(style);

  const footer = document.getElementById("footer");
  if (footer) {
    footer.innerHTML = `Tnm3u &copy; 2025 Live TV`;
  }
})();