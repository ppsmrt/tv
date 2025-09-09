// footer.js
const footerHTML = `
<footer class="fixed bottom-0 w-full bg-black bg-opacity-70 backdrop-blur-md flex justify-around items-center py-2 shadow-lg">
  <!-- Home -->
  <button class="flex flex-col items-center text-xs text-gray-300 hover:text-red-500 transition" data-href="/">
    <span class="material-icons text-lg">home</span>
    Home
  </button>

  <!-- Playlist -->
  <button class="flex flex-col items-center text-xs text-gray-300 hover:text-red-500 transition" data-href="playlist">
    <span class="material-icons text-lg">subscriptions</span>
    Playlist
  </button>

  <!-- Floating Add Button -->
  <div class="relative -mt-8">
    <button class="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition transform hover:scale-105" data-href="add-channel">
      <span class="material-icons text-2xl">add</span>
    </button>
  </div>

  <!-- Profile -->
  <button class="flex flex-col items-center text-xs text-gray-300 hover:text-red-500 transition" data-href="signin">
    <span class="material-icons text-lg">person</span>
    Profile
  </button>

  <!-- Dashboard -->
  <button class="flex flex-col items-center text-xs text-gray-300 hover:text-red-500 transition" data-href="dashboard">
    <span class="material-icons text-lg">dashboard</span>
    Dashboard
  </button>
</footer>
`;

document.body.insertAdjacentHTML('beforeend', footerHTML);

// Get current page
const currentPage = window.location.pathname.split("/").pop();

// Highlight the active button
document.querySelectorAll('footer button').forEach(btn => {
  const btnHref = btn.getAttribute('data-href');
  if (btnHref === currentPage) {
    btn.classList.remove('text-gray-300');
    btn.classList.add('text-red-500');
  }

  // Make buttons clickable
  btn.addEventListener('click', () => {
    window.location.href = btnHref;
  });
});
