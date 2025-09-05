// footer.js
const footerHTML = `
<footer class="fixed bottom-0 w-full flex justify-around bg-black bg-opacity-60 p-2">
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" data-href="index">
    <span class="material-icons">home</span>Home
  </button>
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" data-href="generate">
    <span class="material-icons">subscriptions</span>Playlist
  </button>
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" data-href="search">
    <span class="material-icons">search</span>Search
  </button>
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" data-href="signin">
    <span class="material-icons">person</span>Profile
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