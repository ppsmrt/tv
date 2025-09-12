const header = document.getElementById('header');
header.innerHTML = `
<header class="flex justify-between items-center px-6 py-4 bg-black text-white shadow-md">
  <h1 class="font-bold text-xl">Live TV</h1>
  <label class="theme-switch">
    <input type="checkbox" id="themeToggle">
    <span class="slider"></span>
  </label>
</header>
`;

import { toggleTheme } from './theme.js';
const toggleInput = document.getElementById('themeToggle');

// Set initial toggle state based on saved theme
toggleInput.checked = document.body.classList.contains('theme-light');

toggleInput.addEventListener('change', toggleTheme);