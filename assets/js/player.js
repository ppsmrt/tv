document.addEventListener('DOMContentLoaded', () => {
  // Initialize Plyr
  const player = new Plyr('#tvPlayer', { 
      autoplay: true,
      muted: false,
      controls: ['play', 'progress', 'volume', 'fullscreen']
  });

  let currentChannelIndex = 0;
  let channelsData = [];

  // Load channels from JSON
  async function loadChannels() {
      try {
          const res = await fetch('data/channels.json'); // ✅ fixed path
          channelsData = await res.json();
          renderChannels(channelsData);
          if (channelsData[0]) switchChannel(0);
      } catch (err) {
          console.error("Failed to load channels:", err);
      }
  }

  // Render channel cards
  function renderChannels(channels) {
      const grid = document.getElementById('channelsGrid');
      grid.innerHTML = ''; // clear existing

      channels.forEach((channel, index) => {
          const div = document.createElement('div');
          div.className = "cursor-pointer p-2 bg-white rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white flex flex-col items-center";

          div.innerHTML = `
              <img src="${channel.icon}" alt="${channel.name}" class="w-full h-24 object-contain mb-2 rounded">
              <p class="text-center font-semibold text-gray-900 hover:text-white">${channel.name}</p>
          `;

          div.addEventListener('click', () => switchChannel(channelsData.findIndex(c => c.name === channel.name)));
          grid.appendChild(div);
      });
  }

  // Switch video channel
  function switchChannel(index) {
      const channel = channelsData[index];
      if (!channel) return;

      player.source = {
          type: 'video',
          sources: [{ src: channel.stream, type: 'application/x-mpegURL' }]
      };
      player.play();

      // Highlight selected card
      const allCards = document.getElementById('channelsGrid').children;
      Array.from(allCards).forEach((card, i) => {
          if(i === index){
              card.classList.add('ring-4', 'ring-red-500');
          } else {
              card.classList.remove('ring-4', 'ring-red-500');
          }
      });

      currentChannelIndex = index;
  }

  // Search filter
  document.getElementById('channelSearch').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = channelsData.filter(c => c.name.toLowerCase().includes(term));
      renderChannels(filtered);
      if(filtered[0]) {
          const newIndex = channelsData.findIndex(c => c.name === filtered[0].name);
          switchChannel(newIndex);
      }
  });

  loadChannels();
});