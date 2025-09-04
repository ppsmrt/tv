// header.js
export function injectHeader() {
  const headerHTML = `
    <header>
      <span class="material-icons">live_tv</span>
      <h1 class="ml-2 text-lg font-bold">Live Player</h1>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}