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
    .counter-wrapper {
      margin-top: 0.25rem;
    }
  `;
  document.head.appendChild(style);

  // Footer content
  const footer = document.getElementById("footer");
  if (footer) {
    const currentYear = new Date().getFullYear();
    footer.innerHTML = `
      ©️ ${currentYear} Live TV · Innovation in Entertainment.
      <div class="counter-wrapper" id="customCounter"></div>
    `;
  }

  // Inject your free counter script
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://counter.websiteout.com/js/7/15/11196/0";
  document.getElementById("customCounter").appendChild(script);
})();
