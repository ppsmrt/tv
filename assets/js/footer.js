// footer.js
const footerHTML = `
<footer class="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-opacity-95 flex justify-between items-center px-8 py-3 rounded-t-3xl border-t border-gray-800 shadow-2xl z-50">
  
  <!-- Left Buttons -->
  <div class="flex space-x-8">
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-red-500 transition transform hover:scale-110" data-href="/">
      <span class="material-icons text-2xl mb-1">home</span>
      Home
    </button>
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-red-500 transition transform hover:scale-110" data-href="favourites">
      <span class="material-icons text-2xl mb-1">favorite</span>
      Favourites
    </button>
  </div>

  <!-- Floating Add Button (Clean, No Bar) -->
  <div class="absolute left-1/2 -translate-x-1/2 -top-10">
    <button class="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-5 rounded-full shadow-xl shadow-red-600/50 transition transform hover:scale-110 hover:rotate-6 border border-red-500" data-href="add-channel">
      <span class="material-icons text-3xl">add</span>
    </button>
  </div>

  <!-- Right Buttons -->
  <div class="flex space-x-8">
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-red-500 transition transform hover:scale-110" data-href="https://tnm3u.live/fm">
      <span class="material-icons text-2xl mb-1">radio</span>
      Radios
    </button>
    <button class="flex flex-col items-center text-xs text-gray-400 hover:text-red-500 transition transform hover:scale-110" data-href="dashboard">
      <span class="material-icons text-2xl mb-1">dashboard</span>
      Dashboard
    </button>
  </div>
</footer>
`;

document.body.insertAdjacentHTML('beforeend', footerHTML);

// Highlight active page
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll('footer button').forEach(btn => {
  const btnHref = btn.getAttribute('data-href');
  if (btnHref === currentPage) {
    btn.classList.remove('text-gray-400');
    btn.classList.add('text-red-500', 'font-semibold');
  }

  // Navigation
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-href');
    if (target) {
      window.location.href = target;
    }
  });
});