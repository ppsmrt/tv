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
    #footer:hover {
      color: #FFD700; /* subtle golden highlight */
    }
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

  // Firebase visitor counter
  if (typeof firebase !== 'undefined') {
    const visitsRef = firebase.database().ref("visits");

    // Increment visitor count
    function incrementVisitorCount() {
      visitsRef.transaction(current => {
        return (current || 0) + 1;
      });
    }

    // Display visitor count
    function displayVisitorCount() {
      visitsRef.on('value', snapshot => {
        const count = snapshot.val() || 0;
        const countEl = document.getElementById('visitorCount');
        if (countEl) countEl.textContent = count.toLocaleString();
      });
    }

    // Initialize counter
    incrementVisitorCount();
    displayVisitorCount();
  }
})();