// footer.js
const footerHTML = `
<footer class="fixed bottom-0 w-full flex justify-around bg-black bg-opacity-60 p-2">
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" onclick="window.location.href='index.html'">
    <span class="material-icons">home</span>Home
  </button>
  <button class="flex flex-col items-center text-sm text-red-500">
    <span class="material-icons">live_tv</span>Live
  </button>
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500">
    <span class="material-icons">search</span>Search
  </button>
  <button class="flex flex-col items-center text-sm text-gray-300 hover:text-red-500" onclick="window.location.href='signin.html'">
    <span class="material-icons">person</span>Profile
  </button>
</footer>
`;

document.body.insertAdjacentHTML('beforeend', footerHTML);