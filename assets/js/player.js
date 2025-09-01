// assets/js/player.js
const style = document.createElement('style');
style.innerHTML = `
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
.animate-ripple { animation: ripple 0.5s linear; }

@keyframes pop { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
.animate-pop { animation: pop 0.35s ease-out forwards; }

@keyframes slideDown { 0% { transform: translateY(-20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.animate-slideDown { animation: slideDown 0.5s ease-out forwards; }

@keyframes fadeUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.animate-fadeUp { animation: fadeUp 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

const categories = ["All", "Entertainment", "Music", "News"];
let selectedCategory = "All";
let channelsData = [];

function renderCategories() {
  const row = document.getElementById('categoriesRow');
  row.innerHTML = '';
  row.classList.add('animate-slideDown');

  categories.forEach((cat, i) => {
    const btn = document.createElement('a');
    btn.textContent = cat;
    btn.href = "#";
    btn.className = `px-5 py-2 rounded-full whitespace-nowrap transform transition-all duration-200 shadow-sm opacity-0 ${
      selectedCategory === cat 
        ? 'bg-white text-red-600 font-bold relative overflow-hidden' 
        : 'bg-gray-200/50 text-gray-900 hover:bg-white hover:text-red-600 hover:scale-105 relative overflow-hidden'
    }`;

    btn.style.animation = `slideDown 0.5s ease-out forwards`;
    btn.style.animationDelay = `${i * 80}ms`;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedCategory = cat;
      renderCategories();
      renderChannels();
    });

    row.appendChild(btn);
  });
}

function renderChannels() {
  const grid = document.getElementById('channelsGrid');
  grid.innerHTML = '';
  const filtered = channelsData.filter(
    c => selectedCategory === "All" || c.category === selectedCategory
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="col-span-4 text-center text-gray-500">No channels found</p>`;
    return;
  }

  filtered.forEach((channel, index) => {
    const div = document.createElement('div');
    div.className =
      'flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 animate-fadeUp animate-pop';
    div.style.animationDelay = `${index * 80}ms`;
    div.innerHTML = `
      <div class="w-full aspect-square bg-white rounded-lg shadow-sm flex items-center justify-center p-3">
        <img src="${channel.icon}" alt="${channel.name}" 
             class="w-16 h-16 object-contain"/>
      </div>
      <span class="text-sm font-medium text-gray-900 text-center select-none w-full px-1 mt-2 leading-tight">
        ${channel.name}
      </span>
    `;
    div.addEventListener('click', () => {
      const nameParam = encodeURIComponent(channel.name);
      window.location.href = \`https://ppsmrt.github.io/tv/player.html?name=\${nameParam}\`;
    });
    grid.appendChild(div);
  });
}

async function loadChannels() {
  try {
    const res = await fetch('https://ppsmrt.github.io/tv/data/channels.json');
    if (!res.ok) throw new Error("HTTP " + res.status);
    channelsData = await res.json();
    console.log("Loaded channels:", channelsData); // Debug
    renderCategories();
    renderChannels();
  } catch (err) {
    console.error("Failed to load channels:", err);
    document.getElementById('channelsGrid').innerHTML =
      `<p class="col-span-4 text-center text-red-600">⚠️ Failed to load channels</p>`;
  }
}

loadChannels();