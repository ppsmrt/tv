document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('playerPopup');
  const closeBtn = document.getElementById('closePopup');

  const popupPlayer = new Plyr('#popupPlayer', { 
      autoplay: true,
      muted: false,
      controls: ['play', 'progress', 'volume', 'fullscreen']
  });

  let channelsData = [];
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Auto-hide controls after X seconds
  let hideControlsTimeout;
  function scheduleHideControls() {
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = setTimeout(() => {
          popupPlayer.elements.controls.classList.add('opacity-0', 'pointer-events-none');
      }, 3000); // 3 seconds
  }

  function showControls() {
      popupPlayer.elements.controls.classList.remove('opacity-0', 'pointer-events-none');
      scheduleHideControls();
  }

  // Load channels
  async function loadChannels() {
      try {
          const res = await fetch('data/channels.json');
          channelsData = await res.json();
          renderChannels(channelsData);
      } catch (err) {
          console.error("Failed to load channels:", err);
      }
  }

  // Render channel logos
  function renderChannels(channels) {
      const grid = document.getElementById('channelsGrid');
      grid.innerHTML = '';

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

              // Auto fullscreen on mobile
              if(isMobile){
                  const videoEl = document.getElementById('popupPlayer');
                  if(videoEl.requestFullscreen){
                      videoEl.requestFullscreen();
                  } else if(videoEl.webkitEnterFullscreen){
                      videoEl.webkitEnterFullscreen();
                  }
              }

              // Show controls initially and schedule hide
              showControls();
          });

          grid.appendChild(div);
      });
  }

  // Close popup
  function closePopup() {
      popupPlayer.stop();
      popup.classList.add('hidden');
      if(document.fullscreenElement){
          document.exitFullscreen();
      }
  }

  closeBtn.addEventListener('click', closePopup);
  popup.addEventListener('click', (e) => {
      if(e.target === popup){
          closePopup();
      }
  });

  // Show controls on user interaction
  popupPlayer.on('play', showControls);
  popupPlayer.on('pause', showControls);
  popupPlayer.on('mousemove', showControls);
  popupPlayer.on('touchstart', showControls);

  // Search filter
  document.getElementById('channelSearch').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = channelsData.filter(c => c.name.toLowerCase().includes(term));
      renderChannels(filtered);
  });

  loadChannels();
});