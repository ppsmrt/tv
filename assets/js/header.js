// header.js
const path = window.location.pathname.split("/").pop(); // get current page filename

// Function to convert filename to pretty page name
function getPrettyPageName(filename) {
  if (!filename) return 'Page'; // fallback
  const name = filename.replace('.html', '');        // remove .html
  const words = name.split(/[-_]/);                 // split by - or _
  const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  return capitalized.join(' ');                     // join with spaces
}

let headerHTML = '';

if (path === 'index.html' || path === '') {
  // Home page header
  headerHTML = `
  <header class="flex items-center justify-between p-3 bg-black bg-opacity-50 fixed w-full top-0 z-50">
    <h1 class="text-lg font-semibold truncate">Live TV</h1>
    <button aria-label="Notifications" class="material-icons">notifications</button>
  </header>
  `;
} else if (path === 'player.html') {
  // Player page header
  const streamName = 'Channel Name'; // or dynamically set if needed
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
  const pageName = getPrettyPageName(path);

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