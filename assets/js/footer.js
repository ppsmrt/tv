const footerContainer = document.getElementById("footer-container");
footerContainer.innerHTML = `
  <div class="bottom-nav">
    <button class="active" onclick="navigate('home')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
      </svg>
      Home
    </button>
    <button onclick="navigate('categories')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      Categories
    </button>
    <button onclick="navigate('favorites')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Favorites
    </button>
    <button onclick="navigate('settings')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 11V7a4 4 0 014-4h4M7 7v4a4 4 0 004 4h4" />
      </svg>
      Settings
    </button>
  </div>
`;

function navigate(page){
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.remove("active"));
  event.currentTarget.classList.add("active");
  // Optional: implement page switching logic
}
