// footer.js
const footerHTML = `
<footer class="fixed bottom-0 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-opacity-90 backdrop-blur-xl flex justify-between items-center px-8 py-3 shadow-2xl rounded-t-3xl border-t border-gray-700 relative">
  
  <!-- Left Buttons -->
  <div class="flex space-x-8">
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-white transition transform hover:scale-110" data-href="/">
      <span class="material-icons text-xl mb-1">home</span>
      Home
    </button>
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-white transition transform hover:scale-110" data-href="playlist">
      <span class="material-icons text-xl mb-1">subscriptions</span>
      Playlist
    </button>
  </div>

  <!-- Curved Cut-Out for FAB -->
  <div class="absolute left-1/2 -translate-x-1/2 -top-8 bg-transparent">
    <div class="relative">
      <!-- FAB Button -->
      <button class="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-5 rounded-full shadow-xl shadow-blue-500/40 transition transform hover:scale-110 hover:rotate-6 border border-blue-300 backdrop-blur-md" data-href="add-channel">
        <span class="material-icons text-3xl">add</span>
      </button>
      <!-- Curved Background behind FAB -->
      <div class="absolute top-6 -left-20 w-40 h-10 bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-t-full z-[-1]"></div>
    </div>
  </div>

  <!-- Right Buttons -->
  <div class="flex space-x-8">
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-white transition transform hover:scale-110" data-href="signin">
      <span class="material-icons text-xl mb-1">person</span>
      Profile
    </button>
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-white transition transform hover:scale-110" data-href="dashboard">
      <span class="material-icons text-xl mb-1">dashboard</span>
      Dashboard
    </button>
  </div>
</footer>
`;

document.body.insertAdjacentHTML('beforeend', footerHTML);

// Highlight the active button
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll('footer button').forEach(btn => {
  const btnHref = btn.getAttribute('data-href');
  if (btnHref === currentPage) {
    btn.classList.remove('text-gray-400');
    btn.classList.add('text-blue-400');
  }

  // Navigation
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-href');
    if (target) {
      window.location.href = target;
    }
  });
});
