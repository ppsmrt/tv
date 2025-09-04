// footer.js
const footerHTML = `
<footer class="fixed bottom-0 w-full flex justify-around bg-black bg-opacity-60 p-2">
  <button id="homeBtn" class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" onclick="window.location.href='index.html'">
    <span class="material-icons">home</span>Home
  </button>
  <button id="liveBtn" class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" onclick="window.location.href='live.html'">
    <span class="material-icons">live_tv</span>Live
  </button>
  <button id="searchBtn" class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" onclick="window.location.href='search.html'">
    <span class="material-icons">search</span>Search
  </button>
  <button id="profileBtn" class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" onclick="window.location.href='signin.html'">
    <span class="material-icons">person</span>Profile
  </button>
</footer>
`;

document.body.insertAdjacentHTML('beforeend', footerHTML);

// Highlight the active page button
const path = window.location.pathname.split("/").pop(); // Get current page file name

switch (path) {
  case 'index.html':
    document.getElementById('homeBtn').classList.remove('text-gray-300');
    document.getElementById('homeBtn').classList.add('text-red-500');
    break;
  case 'live.html':
    document.getElementById('liveBtn').classList.remove('text-gray-300');
    document.getElementById('liveBtn').classList.add('text-red-500');
    break;
  case 'search.html':
    document.getElementById('searchBtn').classList.remove('text-gray-300');
    document.getElementById('searchBtn').classList.add('text-red-500');
    break;
  case 'signin.html':
    document.getElementById('profileBtn').classList.remove('text-gray-300');
    document.getElementById('profileBtn').classList.add('text-red-500');
    break;
  default:
    break;
}