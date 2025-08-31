// Tailwind keyframe animations for ripple, pop, and slide
const style = document.createElement('style');
style.innerHTML = `
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}
.animate-ripple { animation: ripple 0.5s linear; }

@keyframes pop {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
.animate-pop { animation: pop 0.35s ease-out forwards; }

@keyframes slideDown {
  0% { transform: translateY(-20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-slideDown { animation: slideDown 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

// Categories & Channel Data
const categories = ["All", "Entertainment", "Music", "News"];
let selectedCategory = "All";
let channelsData = [];

// Render categories dynamically
function renderCategories() {
  const row = document.getElementById('categoriesRow');
  row.innerHTML = '';
  row.classList.add('animate-slideDown'); // Slide-in entire row
  categories.forEach((cat, i) => {
    const btn = document.createElement('a');
    btn.textContent = cat;
    btn.href = "#";
    btn.className = `px-5 py-2 rounded-full whitespace-nowrap transform transition-all duration-200 shadow-sm opacity-0 ${
      selectedCategory === cat 
        ? 'bg-white text-red-600 font-bold relative overflow-hidden' 
        : 'bg-red-500/80 text-white hover:bg-white hover:text-red-600 hover:scale-105 relative overflow-hidden'
    }`;
    
    // Slide-in stagger
    btn.style.animation = `slideDown 0.5s ease-out forwards`;
    btn.style.animationDelay = `${i * 80}ms`;

    // Ripple effect
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      
      const ripple = document.createElement('span');
      ripple.className = 'absolute rounded-full bg-white/30 transform scale-0 animate-ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size/2}px`;
      ripple.style.top = `${e.clientY - rect.top - size/2}px`;
      btn.appendChild(ripple);
      setTimeout(()=> ripple.remove(), 500);

      selectedCategory = cat;
      renderCategories();
      renderChannels();
    });
    row.appendChild(btn);
  });
}

// Render channels dynamically
function renderChannels() {
  const grid = document.getElementById('channelsGrid');
  grid.innerHTML = '';
  const filtered = channelsData.filter(c => selectedCategory==="All" || c.category===selectedCategory);
  filtered.forEach((channel, index)=>{
    const div = document.createElement('div');
    div.style.animationDelay = `${index * 50}ms`; // stagger pop
    div.className = 'flex flex-col items-center space-y-1 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl bg-gradient-to-br from-white to-gray-50 animate-pop';
    div.innerHTML = `
      <img src="${channel.icon}" alt="${channel.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-contain transform transition-transform duration-200 hover:scale-110"/>
      <span class="text-xs sm:text-sm text-gray-900 text-center select-none truncate" style="max-width:64px;">
        ${channel.name}
      </span>
    `;
    div.addEventListener('click', ()=>{
      const nameParam = encodeURIComponent(channel.name);
      window.location.href = `https://ppsmrt.github.io/tv/player.html?name=${nameParam}`;
    });
    grid.appendChild(div);
  });
}

// Load channels from JSON
async function loadChannels() {
  try {
    const res = await fetch('https://ppsmrt.github.io/tv/data/channels.json');
    channelsData = await res.json();
    renderCategories();
    renderChannels();
  } catch(err) {
    console.error("Failed to load channels:", err);
  }
}

loadChannels();