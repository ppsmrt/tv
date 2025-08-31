document.addEventListener('DOMContentLoaded', () => {
  const categories = ["All", "Entertainment", "Music", "News"];
  let channelsData = [];
  let selectedCategory = "All";

  // Load channels.json
  async function loadChannels() {
      try {
          const res = await fetch('data/channels.json'); // path relative to index.html
          channelsData = await res.json();
          renderCategories();
          renderChannels();
      } catch (err) {
          console.error("Failed to load channels:", err);
      }
  }

  // Render stacked category buttons
  function renderCategories() {
      const row = document.getElementById('categoriesRow');
      row.innerHTML = '';

      categories.forEach(cat => {
          const btn = document.createElement('button');
          btn.textContent = cat;
          btn.className = `
              px-6 py-3 rounded-2xl font-semibold
              ${cat === selectedCategory ? 'bg-red-600 text-white' : 'bg-red-500 text-white/80'}
              hover:bg-red-700
              flex-shrink-0
          `;
          btn.addEventListener('click', () => {
              selectedCategory = cat;
              renderCategories();
              renderChannels();
          });
          row.appendChild(btn);
      });
  }

  // Render channels grid
  function renderChannels() {
      const grid = document.getElementById('channelsGrid');
      grid.innerHTML = '';

      let channels = channelsData;
      if(selectedCategory !== "All"){
          channels = channels.filter(c => c.category === selectedCategory);
      }

      channels.forEach(channel => {
          const div = document.createElement('div');
          div.className = `
              cursor-pointer
              p-2
              bg-white/10
              backdrop-blur-md
              border border-white/20
              rounded-xl
              shadow-2xl
              transform transition duration-300
              hover:scale-105 hover:bg-red-600 hover:text-white
              flex flex-col items-center
          `;

          div.innerHTML = `
              <img src="${channel.icon}" alt="${channel.name}" class="w-full h-24 object-contain mb-2 rounded">
              <p class="text-center font-semibold text-black">${channel.name}</p>
          `;

          // Open player.html on click
          div.addEventListener('click', () => {
              const streamUrl = encodeURIComponent(channel.stream);
              const name = encodeURIComponent(channel.name);
              window.location.href = `player.html?stream=${streamUrl}&name=${name}`;
          });

          grid.appendChild(div);
      });
  }

  loadChannels();
});