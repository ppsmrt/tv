// header.js

const path = window.location.pathname.split("/").pop(); // get current page filename

let headerHTML = '';

if(path === 'index.html' || path === '') {
  // Home page header
  headerHTML = `
  <header class="flex items-center justify-between p-3 bg-black bg-opacity-50 fixed w-full top-0 z-50">
    <h1 class="text-lg font-semibold truncate">Live TV</h1>
    <button aria-label="Notifications" class="material-icons">notifications</button>
  </header>
  `;
} else if(path === 'player.html') {
  // Player page header
  const streamName = document.title || 'Channel Name'; // you can dynamically set title
  headerHTML = `
  <header class="flex items-center justify-between p-3 bg-black bg-opacity-50 fixed w-full top-0 z-50">
    <a href="index.html" aria-label="Back" class="flex items-center space-x-1">
      <span class="material-icons">arrow_back</span>
    </a>
    <h1 class="text-lg font-semibold truncate">${streamName}</h1>
    <button aria-label="Notifications" class="material-icons">notifications</button>
  </header>
  `;
} else {
  // Other pages
  const pageName = document.title || 'Page';
  headerHTML = `
  <header class="flex items-center justify-between p-3 bg-black bg-opacity-50 fixed w-full top-0 z-50">
    <a href="javascript:history.back()" aria-label="Back" class="flex items-center space-x-1">
      <span class="material-icons">arrow_back</span>
    </a>
    <h1 class="text-lg font-semibold truncate">${pageName}</h1>
    <button aria-label="Notifications" class="material-icons">notifications</button>
  </header>
  `;
}

document.body.insertAdjacentHTML('afterbegin', headerHTML);