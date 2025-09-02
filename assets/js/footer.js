// Footer navigation buttons
const footer = document.querySelector('footer');
footer.innerHTML = `
  <button class="bottom-nav-btn active" onclick="window.location.href='index.html'"><span class="material-icons">home</span>Home</button>
  <button class="bottom-nav-btn"><span class="material-icons">live_tv</span>Live</button>
  <button class="bottom-nav-btn"><span class="material-icons">search</span>Search</button>
  <button class="bottom-nav-btn" onclick="window.location.href='signin.html'"><span class="material-icons">person</span>Profile</button>
`;