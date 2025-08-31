const player = new Plyr('#tvPlayer', { 
    autoplay: true,
    muted: false,
    controls: ['play', 'progress', 'volume', 'fullscreen']
});

let currentChannelIndex = 0;

async function loadChannels() {
    const res = await fetch('data/channels.json');
    const channels = await res.json();
    const grid = document.getElementById('channelsGrid');

    channels.forEach((channel, index) => {
        const div = document.createElement('div');
        div.className = "cursor-pointer p-2 bg-white rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:bg-red-600 hover:text-white flex flex-col items-center";

        div.innerHTML = `
            <img src="${channel.icon}" alt="${channel.name}" class="w-full h-24 object-contain mb-2 rounded">
            <p class="text-center font-semibold text-gray-900 hover:text-white">${channel.name}</p>
        `;

        div.addEventListener('click', () => {
            switchChannel(index);
        });

        grid.appendChild(div);
    });

    // Auto-play first channel
    if (channels[0]) {
        switchChannel(0);
    }

    function switchChannel(index) {
        const channel = channels[index];
        player.source = {
            type: 'video',
            sources: [
                { src: channel.stream, type: 'application/x-mpegURL' }
            ]
        };
        player.play();

        // Highlight current playing channel
        const allCards = grid.children;
        Array.from(allCards).forEach((card, i) => {
            if(i === index){
                card.classList.add('ring-4', 'ring-red-500');
            } else {
                card.classList.remove('ring-4', 'ring-red-500');
            }
        });

        currentChannelIndex = index;
    }
}

loadChannels();