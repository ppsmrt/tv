document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('playerPopup');
  const closeBtn = document.getElementById('closePopup');
  const popupPlayer = new Plyr('#popupPlayer', { 
      autoplay: true,
      muted: false,
      controls: ['play', 'progress', 'volume', 'fullscreen']
  });
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let channelsData = [];
  let categories = ["All", "Entertainment", "Music", "News"];
  let selectedCategory = "All";

  // Load channels
  async function loadChannels() {
      try {
          const res = await fetch('https://ppsmrt.github.io/tv/data/channels.json');
          channelsData = await res.json();
          renderCategories();
          renderChannels();
      } catch (err) {
          console.error("Failed to load channels:", err);
      }
  }

  // Render horizontal category cards
  function renderCategories() {
      const row = document.getElementById('categoriesRow');
      row.innerHTML = '';

      categories.forEach(cat => {
          const btn = document.createElement('button');
          btn.textContent = cat;
          btn.className = `
              px-4 py-2 rounded-xl font-semibold
              ${cat === selectedCategory ? 'bg-red-600' : 'bg-white/10'}
              hover:bg-red-600
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

  // Render channels
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
              <p class="text-center font-semibold text-gray-100">${channel.name}</p>
          `;

          div.addEventListener('click', async () => {
              popupPlayer.source = {
                  type: 'video',
                  sources: [{ src: channel.stream, type: 'application/x-mpegURL' }]
              };
              popup.classList.remove('hidden');
              await new Promise(r => setTimeout(r, 100));
              popupPlayer.play();

              if(isMobile){
                  const videoEl = document.getElementById('popupPlayer');
                  if(videoEl.requestFullscreen) videoEl.requestFullscreen();
                  else if(videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
              }
          });

          grid.appendChild(div);
      });
  }

  // Close popup
  function closePopup() {
      popupPlayer.stop();
      popup.classList.add('hidden');
      if(document.fullscreenElement) document.exitFullscreen();
  }

  closeBtn.addEventListener('click', closePopup);
  popup.addEventListener('click', e => { if(e.target === popup) closePopup(); });

  // Search filter
  document.getElementById('channelSearch').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      channelsData.forEach(c => c.visible = c.name.toLowerCase().includes(term));
      renderChannels();
  });

  loadChannels();
});