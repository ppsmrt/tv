// header.js
export function injectHeader() {
  const headerHTML = `
    <header class="flex items-center px-6 h-16 bg-gray-900/90 shadow-md z-50">
      <span class="material-icons text-white">live_tv</span>
      <h1 class="ml-2 text-lg font-bold text-white">Live Player</h1>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}